import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth.jsx';

export default function AdminOnlyRoute({ children }) {
  const { isAuthenticated: isAdmin } = useAdminAuth();

  // Rediriger vers le dashboard si l'utilisateur n'est pas admin
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Afficher le contenu protégé pour les admins
  return children;
}
