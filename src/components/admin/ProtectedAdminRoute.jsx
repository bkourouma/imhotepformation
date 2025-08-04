import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuthLogic } from '../../hooks/useAdminAuth.jsx';
import LoadingSpinner from '../shared/LoadingSpinner';

export default function ProtectedAdminRoute({ children }) {
  const location = useLocation();
  const { shouldRedirectToLogin, loading } = useAdminAuthLogic();

  // Afficher un spinner pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Vérification des permissions..." />
      </div>
    );
  }

  // Rediriger vers la connexion si nécessaire
  if (shouldRedirectToLogin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Afficher le contenu protégé
  return children;
}
