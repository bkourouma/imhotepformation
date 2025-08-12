import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCompanySession } from '../../hooks/useCompanySession';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { seancesService } from '../../services/api';
import Layout from '../../components/shared/Layout';
import Card from '../../components/shared/Card';
import Table from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import ExportButton from '../../components/shared/ExportButton';
import { Plus, Search, Edit, Trash2, Eye, Calendar, Clock } from 'lucide-react';
import { columnConfigs } from '../../utils/excelExport';
import { dateUtils } from '../../utils/helpers';

const SeancesList = () => {
  const { selectedCompany } = useCompanySession();
  const { isAuthenticated: isAdmin } = useAdminAuth();
  const location = useLocation();
  
  // Determine if we're in admin section
  const isAdminSection = location.pathname.startsWith('/admin');
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, seance: null });

  useEffect(() => {
    loadSeances();
  }, [searchTerm]);

  const loadSeances = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchTerm
      };

      console.log('Loading seances with filters:', filters);

      const response = await seancesService.getAll(filters);
      console.log('API response:', response);

      // Ensure response is an array
      const seancesData = Array.isArray(response) ? response : [];
      setSeances(seancesData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des séances');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (seance) => {
    try {
      await seancesService.delete(seance.id);
      setDeleteModal({ show: false, seance: null });
      loadSeances();
    } catch (err) {
      setError('Erreur lors de la suppression de la séance');
      console.error('Erreur:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return dateUtils.format(date, 'dd/MM/yyyy');
  };

  // Helper functions for route generation
  const getSeanceDetailRoute = (seanceId) => {
    return isAdminSection ? `/admin/seances/${seanceId}` : `/seances/${seanceId}`;
  };

  const getSeanceEditRoute = (seanceId) => {
    return isAdminSection ? `/admin/seances/${seanceId}/edit` : `/seances/${seanceId}/edit`;
  };

  const columns = [
    {
      key: 'intitule',
      label: 'Intitulé',
      render: (value, seance) => (
        <div>
          <div className="font-medium">{seance?.description || seance?.intitule || ''}</div>
          <div className="text-sm text-gray-500">{seance?.formation_nom || ''}</div>
        </div>
      )
    },
    {
      key: 'date_debut',
      label: 'Date de début',
      render: (value, seance) => formatDate(seance?.date_debut)
    },
    {
      key: 'date_fin',
      label: 'Date de fin',
      render: (value, seance) => formatDate(seance?.date_fin)
    },
    {
      key: 'lieu',
      label: 'Lieu',
      render: (value, seance) => seance?.lieu || ''
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (value, seance) => {
        const now = new Date();
        const startDate = seance?.date_debut ? new Date(seance.date_debut) : null;
        const endDate = seance?.date_fin ? new Date(seance.date_fin) : null;

        if (!startDate || !endDate) return 'Non défini';

        if (now < startDate) {
          return <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded text-xs">À venir</span>;
        } else if (now >= startDate && now <= endDate) {
          return <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs">En cours</span>;
        } else {
          return <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded text-xs">Terminé</span>;
        }
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, seance) => seance ? (
        <div className="flex gap-2">
          <Link to={getSeanceDetailRoute(seance.id)}>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>
          {isAdmin && (
            <>
              <Link to={getSeanceEditRoute(seance.id)}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModal({ show: true, seance })}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      ) : null
    }
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">Séances</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Gérez les séances de formation' : 'Consultez les séances de formation'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            data={seances}
            columns={columnConfigs.seances}
            filename="seances"
            sheetName="Séances"
            onExportComplete={(filename) => {
              console.log(`Export réussi: ${filename}`);
            }}
            onExportError={(error) => {
              console.error('Erreur d\'export:', error);
            }}
          />
          {isAdmin && (
            <Button as={Link} to={isAdminSection ? "/admin/seances/new" : "/seances/new"} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle séance
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <Card>
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher une séance..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <ErrorMessage 
          error={error} 
          onDismiss={() => setError(null)}
          title="Erreur"
        />
      )}

      {/* Table */}
      <Card>
        {seances.length > 0 ? (
          <Table 
            data={seances} 
            columns={columns}
            className="w-full"
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Aucune séance trouvée' : 'Aucune séance pour le moment'}
            </p>
            {!searchTerm && isAdmin && (
              <Button as={Link} to="/admin/seances/new">
                Créer la première séance
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer la séance "{deleteModal.seance?.intitule}" ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setDeleteModal({ show: false, seance: null })}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteModal.seance)}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeancesList; 