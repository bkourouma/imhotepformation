import { Menu, LogOut, Shield, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth.jsx';
import Button from '../shared/Button';

export default function AdminHeader({ onMenuClick }) {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const goToUserApp = () => {
    navigate('/');
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Bouton menu mobile */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Ouvrir le menu</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Séparateur */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Titre */}
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-gray-900">
            Panneau d'administration
          </h1>
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6 ml-auto">
          {/* Bouton vers l'application utilisateur */}
          <Button
            variant="ghost"
            size="sm"
            onClick={goToUserApp}
            className="flex items-center gap-2"
            title="Aller à l'application utilisateur"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Application</span>
          </Button>

          {/* Informations admin */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <div className="hidden lg:flex lg:items-center lg:gap-x-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm font-semibold text-gray-900">
                  Administrateur
                </div>
                <div className="text-xs text-gray-500">
                  Session active
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
              title="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
