import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import * as api from '../../services/api';
import Card from '../../components/shared/Card';
import Table from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { Plus, Search, Edit, Trash2, Eye, User, Mail, Phone, BookOpen } from 'lucide-react';

const EnseignantsList = () => {
  const { isAuthenticated: isAdmin } = useAdminAuth();
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ show: false, enseignant: null });

  useEffect(() => {
    loadEnseignants();
  }, [showActiveOnly]);

  const loadEnseignants = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (showActiveOnly) filters.actif = true;
      if (searchTerm) filters.search = searchTerm;
      
      const response = await api.enseignantsService.getAll(filters);
      setEnseignants(response || []);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des enseignants');
      console.error('Erreur loadEnseignants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadEnseignants();
  };

  const handleDelete = async (enseignant) => {
    try {
      await api.enseignantsService.delete(enseignant.id);
      setDeleteModal({ show: false, enseignant: null });
      loadEnseignants();
    } catch (err) {
      setError('Erreur lors de la suppression de l\'enseignant');
      console.error('Erreur:', err);
    }
  };

  const getStatusBadge = (enseignant) => {
    return enseignant.actif ? (
      <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs">Actif</span>
    ) : (
      <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs">Inactif</span>
    );
  };

  const formatSpecialites = (specialites) => {
    if (!specialites || !Array.isArray(specialites)) return '';
    return specialites.slice(0, 3).join(', ') + (specialites.length > 3 ? '...' : '');
  };

  const columns = [
    {
      key: 'nom_complet',
      label: 'Nom',
      render: (_value, enseignant) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-orange-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {enseignant?.prenom} {enseignant?.nom}
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {enseignant?.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'telephone',
      label: 'Téléphone',
      render: (telephone) => telephone ? (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Phone className="h-3 w-3" />
          {telephone}
        </div>
      ) : (
        <span className="text-gray-400">-</span>
      )
    },
    {
      key: 'specialites',
      label: 'Spécialités',
      render: (specialites) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <BookOpen className="h-3 w-3" />
          {formatSpecialites(specialites) || 'Aucune'}
        </div>
      )
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (_value, enseignant) => getStatusBadge(enseignant)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value, enseignant) => (
        <div className="flex gap-2">
          <Button
            as={Link}
            to={`/admin/enseignants/${enseignant.id}`}
            variant="outline"
            size="sm"
          >
            <Eye className="h-3 w-3" />
          </Button>
          {isAdmin && (
            <>
              <Button
                as={Link}
                to={`/admin/enseignants/${enseignant.id}/edit`}
                variant="outline"
                size="sm"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModal({ show: true, enseignant })}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      )
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
          <h1 className="text-2xl font-bold text-gray-900">Enseignants</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Gérez les enseignants' : 'Consultez les enseignants'}
          </p>
        </div>
        {isAdmin && (
          <Button as={Link} to="/admin/enseignants/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvel enseignant
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="p-4">
          <form onSubmit={handleSearch} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nom, prénom, email, spécialités..."
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showActiveOnly}
                  onChange={(e) => setShowActiveOnly(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Actifs uniquement</span>
              </label>
            </div>
            <Button type="submit">
              Rechercher
            </Button>
          </form>
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
        <Table
          data={enseignants}
          columns={columns}
          emptyMessage="Aucun enseignant trouvé"
        />
      </Card>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer l'enseignant "{deleteModal.enseignant?.prenom} {deleteModal.enseignant?.nom}" ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setDeleteModal({ show: false, enseignant: null })}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteModal.enseignant)}
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

export default EnseignantsList;
