import { useState, useEffect, createContext, useContext } from 'react';
import { storageUtils } from '../utils/helpers';
import { employeApi } from '../services/employeApi.js';

const EMPLOYE_SESSION_KEY = 'employe_session';

// Context pour l'authentification employé
const EmployeAuthContext = createContext();

// Hook pour utiliser le contexte
export function useEmployeAuth() {
  const context = useContext(EmployeAuthContext);
  if (!context) {
    throw new Error('useEmployeAuth must be used within an EmployeAuthProvider');
  }
  return context;
}

// Provider pour gérer l'authentification employé
export function EmployeAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employe, setEmploye] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier l'authentification au démarrage
  useEffect(() => {
    const savedSession = storageUtils.get(EMPLOYE_SESSION_KEY);
    if (savedSession && savedSession.authenticated && savedSession.employe) {
      // Vérifier si la session n'a pas expiré (24h)
      const sessionTime = new Date(savedSession.timestamp);
      const now = new Date();
      const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setIsAuthenticated(true);
        setEmploye(savedSession.employe);
      } else {
        // Session expirée
        storageUtils.remove(EMPLOYE_SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  // Connexion employé
  const login = async (email, password) => {
    try {
      const result = await employeApi.login(email, password);

      if (result.success) {
        const session = {
          authenticated: true,
          timestamp: new Date().toISOString(),
          employe: result.employe
        };
        storageUtils.set(EMPLOYE_SESSION_KEY, session);
        setIsAuthenticated(true);
        setEmploye(result.employe);
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Erreur de connexion' };
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { success: false, error: error.message || 'Erreur de connexion au serveur' };
    }
  };

  // Déconnexion employé
  const logout = () => {
    storageUtils.remove(EMPLOYE_SESSION_KEY);
    setIsAuthenticated(false);
    setEmploye(null);
  };

  // Vérifier si l'utilisateur est authentifié
  const checkAuth = () => {
    const savedSession = storageUtils.get(EMPLOYE_SESSION_KEY);
    if (savedSession && savedSession.authenticated) {
      const sessionTime = new Date(savedSession.timestamp);
      const now = new Date();
      const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setIsAuthenticated(true);
        setEmploye(savedSession.employe);
        return true;
      } else {
        logout();
        return false;
      }
    }
    return false;
  };

  const value = {
    isAuthenticated,
    employe,
    loading,
    login,
    logout,
    checkAuth
  };

  return (
    <EmployeAuthContext.Provider value={value}>
      {children}
    </EmployeAuthContext.Provider>
  );
}
