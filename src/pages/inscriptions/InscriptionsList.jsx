import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Filter, Users, Building2, BookOpen, Calendar } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card from '../../components/shared/Card';
import Table from '../../components/shared/Table';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { Input, Select } from '../../components/shared/FormField';
import ExportButton from '../../components/shared/ExportButton';
import { useApi, usePagination } from '../../hooks/useApi';
import { inscriptionsService, entreprisesService, formationsService } from '../../services/api';
import { formatUtils, dateUtils } from '../../utils/helpers';
import { useCompanySession } from '../../hooks/useCompanySession.jsx';
import { useAdminAuth } from '../../hooks/useAdminAuth.jsx';
import { columnConfigs } from '../../utils/excelExport';

export default function InscriptionsList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedCompany } = useCompanySession();
  const { isAuthenticated: isAdmin } = useAdminAuth();

  const [filters, setFilters] = useState({
    entreprise_id: searchParams.get('entreprise_id') || '',
    formation_id: searchParams.get('formation_id') || '',
    date_debut: searchParams.get('date_debut') || '',
    date_fin: searchParams.get('date_fin') || '',
  });

  // Récupération des données - filtrer par entreprise si pas admin
  const { data: inscriptions, loading, error, refetch } = useApi(
    () => {
      const apiFilters = { ...filters };
      // Si pas admin et entreprise sélectionnée, forcer le filtre par entreprise
      if (!isAdmin && selectedCompany) {
        apiFilters.entreprise_id = selectedCompany.id;
      }

      return inscriptionsService.getAll(apiFilters);
    },
    [filters, isAdmin, selectedCompany]
  );

  const { data: entreprises } = useApi(entreprisesService.getAll, []);
  const { data: formations } = useApi(formationsService.getAll, []);

  // Pagination
  const {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    nextPage,
    prevPage,
    hasNext,
    hasPrev,
  } = usePagination(inscriptions || [], 10);

  // Mise à jour des filtres
  const updateFilters = (newFilters) => {
    setFilters(newFilters);
    // Mettre à jour l'URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params);
  };

  // Colonnes du tableau
  const columns = [
    {
      key: 'formation_intitule',
      title: 'Formation',
      sortable: true,
      render: (value, inscription) => (
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-gray-400" />
          <div>
            <span className="font-medium">{value}</span>
            {inscription.formation_cible && (
              <div className="text-sm text-gray-500 mt-1">
                {inscription.formation_cible}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'nombre_seances',
      title: 'Séances',
      render: (value) => (
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{value || 0}</span>
        </div>
      ),
    },
    {
      key: 'nombre_participants',
      title: 'Participants',
      render: (value, inscription) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{value}</span>
          {inscription.nombre_inscriptions > 1 && (
            <span className="text-xs text-gray-500 ml-1">
              ({inscription.nombre_inscriptions} inscriptions)
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'derniere_seance',
      title: 'Dernière séance',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-600">
          {dateUtils.format(value)}
        </span>
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, inscription) => (
        <div className="flex items-center gap-2">
          <Button
            as={Link}
            to={`/formations/${inscription.formation_id}`}
            variant="ghost"
            size="sm"
            className="p-1"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            as={Link}
            to={`/inscriptions/new?formation_id=${inscription.formation_id}`}
            variant="ghost"
            size="sm"
            className="p-1"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Réinitialiser les filtres
  const clearFilters = () => {
    updateFilters({
      entreprise_id: '',
      formation_id: '',
      date_debut: '',
      date_fin: '',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const hasActiveFilters = Object.values(filters).some(value => value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formations et Inscriptions</h1>
          <p className="text-gray-600 mt-1">
            Vue d'ensemble des formations avec leurs séances et participants
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            data={inscriptions || []}
            columns={columnConfigs.inscriptions}
            filename="inscriptions"
            sheetName="Inscriptions"
            onExportComplete={(filename) => {
              console.log(`Export réussi: ${filename}`);
            }}
            onExportError={(error) => {
              console.error('Erreur d\'export:', error);
            }}
          />
          <Button as={Link} to="/inscriptions/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle inscription
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700">Filtres</span>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-primary-600"
              >
                Effacer tous
              </Button>
            )}
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 ${isAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
            {/* Filtre par entreprise - seulement pour les admins */}
            {isAdmin && (
              <Select
                placeholder="Toutes les entreprises"
                value={filters.entreprise_id}
                onChange={(e) => updateFilters({ ...filters, entreprise_id: e.target.value })}
                options={entreprises?.map(entreprise => ({
                  value: entreprise.id,
                  label: entreprise.raison_sociale
                })) || []}
              />
            )}

            <Select
              placeholder="Toutes les formations"
              value={filters.formation_id}
              onChange={(e) => updateFilters({ ...filters, formation_id: e.target.value })}
              options={formations?.map(formation => ({
                value: formation.id,
                label: formation.intitule
              })) || []}
            />

            <Input
              type="date"
              placeholder="Date début"
              value={filters.date_debut}
              onChange={(e) => updateFilters({ ...filters, date_debut: e.target.value })}
            />

            <Input
              type="date"
              placeholder="Date fin"
              value={filters.date_fin}
              onChange={(e) => updateFilters({ ...filters, date_fin: e.target.value })}
            />
          </div>
        </div>
      </Card>

      {/* Messages d'erreur */}
      {error && (
        <ErrorMessage
          error={error}
          onDismiss={() => refetch()}
          title="Erreur lors du chargement des inscriptions"
        />
      )}

      {/* Tableau des inscriptions */}
      <Card padding={false}>
        <Table
          columns={columns}
          data={currentData}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="text-sm text-gray-700">
                Page {currentPage} sur {totalPages} ({inscriptions?.length || 0} inscriptions)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={prevPage}
                  disabled={!hasPrev}
                >
                  Précédent
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={nextPage}
                  disabled={!hasNext}
                >
                  Suivant
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
