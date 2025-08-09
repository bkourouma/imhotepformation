import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEntrepriseAuth } from '../../hooks/useEntrepriseAuth';
import { LoadingSpinner } from './index';

const ProtectedEntrepriseRoute = ({ children }) => {
  const { entreprise, loading, isAuthenticated } = useEntrepriseAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/entreprise/login" replace />;
  }

  return children;
};

export default ProtectedEntrepriseRoute;
