import { Menu, Bell, Search, Building2, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCompanySession } from '../../hooks/useCompanySession.jsx';
import { useAdminAuth } from '../../hooks/useAdminAuth.jsx';
import Button from './Button';

export default function Header({ onMenuClick }) {
  const navigate = useNavigate();
  const { selectedCompany, clearCompany } = useCompanySession();
  const { isAuthenticated: isAdmin, logout: adminLogout } = useAdminAuth();

  const handleChangeCompany = () => {
    clearCompany();
    navigate('/company-selection');
  };

  const handleAdminLogout = () => {
    adminLogout();
    // Optionally redirect or refresh the page
    window.location.reload();
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
        {/* Barre de recherche */}
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Rechercher
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
            placeholder="Rechercher..."
            type="search"
            name="search"
          />
        </form>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Admin controls */}
          {isAdmin ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAdminLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
              title="Se déconnecter du mode admin"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Quitter Admin</span>
            </Button>
          ) : (
            <Button
              as="a"
              href="/admin/dashboard"
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              title="Accéder à l'administration"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          )}

          {/* Séparateur */}
          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200"
            aria-hidden="true"
          />

          {/* Entreprise sélectionnée */}
          {selectedCompany && (
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:flex lg:items-center lg:gap-x-3">
                <Building2 className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedCompany.raison_sociale}
                  </div>
                  <div className="text-xs text-gray-500">
                    {selectedCompany.email}
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleChangeCompany}
                className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
                title="Changer d'entreprise"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Changer</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
