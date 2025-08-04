import { Navigate } from 'react-router-dom';
import { useCompanySessionLogic } from '../../hooks/useCompanySession.jsx';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { shouldRedirectToCompanySelection, loading } = useCompanySessionLogic();

  // Afficher un spinner pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  // Rediriger vers la sélection d'entreprise si nécessaire
  if (shouldRedirectToCompanySelection) {
    return <Navigate to="/company-selection" replace />;
  }

  // Afficher le contenu protégé
  return children;
}
