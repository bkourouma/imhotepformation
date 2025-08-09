import { Navigate, useLocation } from 'react-router-dom';
import { useEmployeAuth } from '../../hooks/useEmployeAuth.jsx';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedEmployeRoute({ children }) {
  const { isAuthenticated, loading } = useEmployeAuth();
  const location = useLocation();

  // Afficher un spinner pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  // Rediriger vers la connexion si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/employe/login" state={{ from: location }} replace />;
  }

  // Afficher le contenu protégé
  return children;
}
