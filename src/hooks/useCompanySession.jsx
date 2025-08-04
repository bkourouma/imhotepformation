import { useState, useEffect, createContext, useContext } from 'react';
import { storageUtils } from '../utils/helpers';

const COMPANY_SESSION_KEY = 'selected_company';

// Context pour partager l'entreprise sélectionnée
const CompanySessionContext = createContext();

// Hook pour utiliser le contexte
export function useCompanySession() {
  const context = useContext(CompanySessionContext);
  if (!context) {
    throw new Error('useCompanySession must be used within a CompanySessionProvider');
  }
  return context;
}

// Provider pour gérer la session d'entreprise
export function CompanySessionProvider({ children }) {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger l'entreprise depuis le stockage local au démarrage
  useEffect(() => {
    const savedCompany = storageUtils.get(COMPANY_SESSION_KEY);
    if (savedCompany) {
      setSelectedCompany(savedCompany);
    }
    setLoading(false);
  }, []);

  // Sélectionner une entreprise
  const selectCompany = (company) => {
    setSelectedCompany(company);
    storageUtils.set(COMPANY_SESSION_KEY, company);
  };

  // Effacer la sélection
  const clearCompany = () => {
    setSelectedCompany(null);
    storageUtils.remove(COMPANY_SESSION_KEY);
  };

  // Vérifier si une entreprise est sélectionnée
  const hasSelectedCompany = Boolean(selectedCompany);

  const value = {
    selectedCompany,
    selectCompany,
    clearCompany,
    hasSelectedCompany,
    loading,
  };

  return (
    <CompanySessionContext.Provider value={value}>
      {children}
    </CompanySessionContext.Provider>
  );
}

// Hook personnalisé pour la logique de session
export function useCompanySessionLogic() {
  const { selectedCompany, hasSelectedCompany, loading } = useCompanySession();

  // Vérifier si l'utilisateur doit être redirigé vers la sélection d'entreprise
  const shouldRedirectToCompanySelection = !loading && !hasSelectedCompany;

  return {
    selectedCompany,
    hasSelectedCompany,
    shouldRedirectToCompanySelection,
    loading,
  };
}
