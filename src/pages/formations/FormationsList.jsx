import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card from '../../components/shared/Card';
import Table from '../../components/shared/Table';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { ConfirmModal } from '../../components/shared/Modal';
import { Input } from '../../components/shared/FormField';
import { useApi, useCrud, useSearch, usePagination } from '../../hooks/useApi';
import { formationsService } from '../../services/api';
import { formatUtils, dateUtils } from '../../utils/helpers';

export default function FormationsList() {
  const [deleteModal, setDeleteModal] = useState({ open: false, formation: null });

  // Hooks pour la recherche et les données
  const { query, setQuery, results, loading: searchLoading } = useSearch(
    formationsService.getAll,
    300
  );

  const { data: allFormations, loading, error, refetch } = useApi(
    formationsService.getAll,
    []
  );

  const { remove, loading: deleteLoading } = useCrud(formationsService);

  // Utiliser les résultats de recherche ou toutes les formations
  const formations = query ? results : (allFormations || []);

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
  } = usePagination(formations, 10);

  // Colonnes du tableau
  const columns = [
    {
      key: 'intitule',
      title: 'Intitulé',
      sortable: true,
      className: 'w-1/3',
      render: (value, formation) => (
        <div className="overflow-hidden">
          <div className="font-medium text-gray-900 truncate" title={value}>
            {value}
          </div>
          <div className="text-sm text-gray-500 truncate" title={formation.cible}>
            {formatUtils.truncate(formation.cible, 40)}
          </div>
        </div>
      ),
    },
    {
      key: 'objectifs_pedagogiques',
      title: 'Objectifs',
      className: 'w-2/5',
      render: (value) => (
        <div className="overflow-hidden">
          <div className="truncate" title={value}>
            {formatUtils.truncate(value, 80)}
          </div>
        </div>
      ),
    },

    {
      key: 'actions',
      title: 'Actions',
      className: 'w-1/6',
      render: (_, formation) => (
        <div className="flex items-center gap-2">
          <Button
            as={Link}
            to={`/formations/${formation.id}`}
            variant="ghost"
            size="sm"
            className="p-1"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            as={Link}
            to={`/formations/${formation.id}/edit`}
            variant="ghost"
            size="sm"
            className="p-1"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-red-600 hover:text-red-700"
            onClick={() => setDeleteModal({ open: true, formation })}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Gestion de la suppression
  const handleDelete = async () => {
    try {
      await remove(deleteModal.formation.id);
      setDeleteModal({ open: false, formation: null });
      refetch();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formations</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos formations et leurs contenus
          </p>
        </div>
        <Button as={Link} to="/formations/new" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle formation
        </Button>
      </div>

      {/* Barre de recherche */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher une formation..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {query && (
            <Button
              variant="secondary"
              onClick={() => setQuery('')}
            >
              Effacer
            </Button>
          )}
        </div>
      </Card>

      {/* Messages d'erreur */}
      {error && (
        <ErrorMessage
          error={error}
          onDismiss={() => refetch()}
          title="Erreur lors du chargement des formations"
        />
      )}

      {/* Tableau des formations */}
      <Card padding={false}>
        {searchLoading ? (
          <div className="flex justify-center items-center h-32">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={currentData}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200">
                <div className="flex items-center justify-between px-6 py-3">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} sur {totalPages} ({formations.length} formations)
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
          </>
        )}
      </Card>

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, formation: null })}
        onConfirm={handleDelete}
        title="Supprimer la formation"
        message={`Êtes-vous sûr de vouloir supprimer la formation "${deleteModal.formation?.intitule}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        loading={deleteLoading}
      />
    </div>
  );
}
