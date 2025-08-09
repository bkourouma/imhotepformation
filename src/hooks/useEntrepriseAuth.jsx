import { useState, useEffect, createContext, useContext } from 'react';
import { api } from '../services/api';

const EntrepriseAuthContext = createContext();

export const useEntrepriseAuth = () => {
  const context = useContext(EntrepriseAuthContext);
  if (!context) {
    throw new Error('useEntrepriseAuth must be used within an EntrepriseAuthProvider');
  }
  return context;
};

export const EntrepriseAuthProvider = ({ children }) => {
  const [entreprise, setEntreprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if entreprise session is stored in localStorage
    const storedSession = localStorage.getItem('entreprise_session');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);

        // Check if session has not expired (24 hours)
        if (session.timestamp) {
          const sessionTime = new Date(session.timestamp);
          const now = new Date();
          const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);

          if (hoursDiff < 24 && session.entreprise) {
            setEntreprise(session.entreprise);
          } else {
            // Session expired
            localStorage.removeItem('entreprise_session');
            localStorage.removeItem('entreprise'); // Remove old format too
          }
        } else {
          // Old format without timestamp - migrate or remove
          localStorage.removeItem('entreprise_session');
          localStorage.removeItem('entreprise');
        }
      } catch (error) {
        console.error('Error parsing stored entreprise session:', error);
        localStorage.removeItem('entreprise_session');
        localStorage.removeItem('entreprise');
      }
    } else {
      // Check for old format and remove it
      const oldFormat = localStorage.getItem('entreprise');
      if (oldFormat) {
        localStorage.removeItem('entreprise');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/entreprise/login', { email, password });
      
      if (response.data.success) {
        const entrepriseData = response.data.entreprise;

        // Create session with timestamp and token
        const session = {
          authenticated: true,
          timestamp: new Date().toISOString(),
          entreprise: entrepriseData,
          token: response.data.token
        };

        setEntreprise(entrepriseData);
        localStorage.setItem('entreprise_session', JSON.stringify(session));

        // Remove old format if it exists
        localStorage.removeItem('entreprise');

        return { success: true, entreprise: entrepriseData };
      } else {
        throw new Error(response.data.error || 'Erreur de connexion');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur de connexion';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (entrepriseData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/entreprise/register', entrepriseData);
      
      if (response.data.success) {
        const newEntreprise = response.data.entreprise;

        // Create session with timestamp and token
        const session = {
          authenticated: true,
          timestamp: new Date().toISOString(),
          entreprise: newEntreprise,
          token: response.data.token
        };

        setEntreprise(newEntreprise);
        localStorage.setItem('entreprise_session', JSON.stringify(session));

        // Remove old format if it exists
        localStorage.removeItem('entreprise');

        return { success: true, entreprise: newEntreprise };
      } else {
        throw new Error(response.data.error || 'Erreur d\'inscription');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur d\'inscription';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint
      await api.post('/entreprise/logout');
    } catch (error) {
      console.error('Error during logout:', error);
      // Continue with client-side logout even if server call fails
    }

    // Clear client-side session
    setEntreprise(null);
    localStorage.removeItem('entreprise_session');
    localStorage.removeItem('entreprise'); // Remove old format too
    setError(null);
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put(`/entreprise/${entreprise.id}/password`, {
        currentPassword,
        newPassword
      });
      
      if (response.data.success) {
        return { success: true };
      } else {
        throw new Error(response.data.error || 'Erreur de mise à jour');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur de mise à jour';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/entreprise/${entreprise.id}/profile`);
      
      if (response.data.success) {
        const updatedEntreprise = response.data.entreprise;
        setEntreprise(updatedEntreprise);
        localStorage.setItem('entreprise', JSON.stringify(updatedEntreprise));
        return { success: true, entreprise: updatedEntreprise };
      } else {
        throw new Error(response.data.error || 'Erreur de récupération du profil');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Erreur de récupération du profil';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Check if session is still valid
  const checkAuth = () => {
    const storedSession = localStorage.getItem('entreprise_session');
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession);

        if (session.timestamp && session.entreprise) {
          const sessionTime = new Date(session.timestamp);
          const now = new Date();
          const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);

          if (hoursDiff < 24) {
            setEntreprise(session.entreprise);
            return true;
          } else {
            // Session expired
            logout();
            return false;
          }
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
        logout();
        return false;
      }
    }
    return false;
  };

  const value = {
    entreprise,
    loading,
    error,
    login,
    register,
    logout,
    updatePassword,
    getProfile,
    clearError,
    checkAuth,
    isAuthenticated: !!entreprise
  };

  return (
    <EntrepriseAuthContext.Provider value={value}>
      {children}
    </EntrepriseAuthContext.Provider>
  );
};
