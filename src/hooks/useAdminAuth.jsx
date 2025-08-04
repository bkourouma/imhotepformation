import { useState, useEffect, createContext, useContext } from 'react';
import { storageUtils } from '../utils/helpers';

const ADMIN_SESSION_KEY = 'admin_session';
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123' // En production, utiliser un système plus sécurisé
};

// Context pour l'authentification admin
const AdminAuthContext = createContext();

// Hook pour utiliser le contexte
export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

// Provider pour gérer l'authentification admin
export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    const savedSession = storageUtils.get(ADMIN_SESSION_KEY);
    if (savedSession && savedSession.authenticated) {
      // Vérifier si la session n'a pas expiré (24h)
      const sessionTime = new Date(savedSession.timestamp);
      const now = new Date();
      const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setIsAuthenticated(true);
      } else {
        // Session expirée
        storageUtils.remove(ADMIN_SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Connexion admin
  const login = (username, password) => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const session = {
        authenticated: true,
        timestamp: new Date().toISOString(),
        username
      };
      storageUtils.set(ADMIN_SESSION_KEY, session);
      setIsAuthenticated(true);
      return { success: true };
    } else {
      return { success: false, error: 'Identifiants incorrects' };
    }
  };

  // Déconnexion admin
  const logout = () => {
    storageUtils.remove(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// Hook pour la logique d'authentification
export function useAdminAuthLogic() {
  const { isAuthenticated, loading } = useAdminAuth();

  // Vérifier si l'utilisateur doit être redirigé vers la connexion
  const shouldRedirectToLogin = !loading && !isAuthenticated;

  return {
    isAuthenticated,
    shouldRedirectToLogin,
    loading,
  };
}
