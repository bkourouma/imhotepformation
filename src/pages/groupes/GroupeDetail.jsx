import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Users, UserPlus, Calendar } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import ExportButton from '../../components/shared/ExportButton';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useEntrepriseAuth } from '../../hooks/useEntrepriseAuth';
import { groupesService } from '../../services/api';
import { columnConfigs } from '../../utils/excelExport';

const GroupeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated: isAdmin } = useAdminAuth();
  const { isAuthenticated: isEntreprise } = useEntrepriseAuth();

  // Determine if we're in enterprise portal
  const isEntreprisePortal = location.pathname.startsWith('/entreprise');
  const [groupe, setGroupe] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, groupe: null });

  useEffect(() => {
    loadGroupe();
  }, [id]);

  const loadGroupe = async () => {
    try {
      setLoading(true);
      const [groupeResponse, participantsResponse] = await Promise.all([
        groupesService.getById(id),
        groupesService.getWithParticipants(id)
      ]);
      setGroupe(groupeResponse);
      setParticipants(participantsResponse?.participants || []);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement du groupe');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await groupesService.delete(id);
      setDeleteModal({ show: false, groupe: null });
      navigate(isEntreprisePortal ? '/entreprise/formations' : '/groupes');
    } catch (err) {
      setError('Erreur lors de la suppression du groupe');
      console.error('Erreur:', err);
    }
  };

  // Helper function to get back route
  const getBackRoute = () => {
    return isEntreprisePortal ? '/entreprise/formations' : '/groupes';
  };

  // Helper function to get edit route
  const getEditRoute = () => {
    return isEntreprisePortal ? `/entreprise/groupes/${id}/edit` : `/groupes/${id}/edit`;
  };

  // Helper function to get participants route
  const getParticipantsRoute = () => {
    return isEntreprisePortal ? `/entreprise/groupes/${id}/participants` : `/groupes/${id}/participants`;
  };

  const getStatusBadge = (groupe) => {
    const participantsCount = groupe?.participants_count || 0;
    const capacite = groupe?.capacite_max || 0;
    
    if (participantsCount >= capacite) {
      return <span className="text-red-600 bg-red-100 px-3 py-1 rounded-full text-sm font-medium">Complet</span>;
    } else if (participantsCount > 0) {
      return <span className="text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full text-sm font-medium">Partiellement rempli</span>;
    } else {
      return <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">Disponible</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        error={error} 
        onDismiss={() => setError(null)}
        title="Erreur"
      />
    );
  }

  if (!groupe) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Groupe non trouvé</p>
        <Button as={Link} to={getBackRoute()} className="mt-4">
          Retour aux groupes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(getBackRoute())}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {groupe.libelle || 'Groupe'}
            </h1>
            <p className="text-gray-600">
              {groupe.seance_nom || 'Séance'} - {groupe.formation_nom || 'Formation'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <ExportButton
            data={participants}
            columns={columnConfigs.participants}
            filename={`participants_${groupe?.libelle || 'groupe'}`}
            sheetName="Participants"
            variant="outline"
            onExportComplete={(filename) => {
              console.log(`Export réussi: ${filename}`);
            }}
            onExportError={(error) => {
              console.error('Erreur d\'export:', error);
            }}
          >
            Exporter participants
          </ExportButton>

          {isAdmin && (
            <Button
              as={Link}
              to={getParticipantsRoute()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Gérer participants
            </Button>
          )}
          
          {isAdmin && (
            <>
              <Button
                as={Link}
                to={getEditRoute()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteModal({ show: true, groupe })}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <ErrorMessage 
          error={error} 
          onDismiss={() => setError(null)}
          title="Erreur"
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Détails du groupe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Détails du groupe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nom du groupe</label>
                  <p className="text-gray-900">{groupe.libelle || 'Non défini'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Séance</label>
                  <p className="text-gray-900">{groupe.seance_nom || 'Non définie'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Formation</label>
                  <p className="text-gray-900">{groupe.formation_nom || 'Non définie'}</p>
                </div>
                
                {groupe.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-gray-900">{groupe.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar avec informations */}
        <div className="space-y-6">
          {/* Statut */}
          <Card>
            <CardHeader>
              <CardTitle>Statut</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                {getStatusBadge(groupe)}
              </div>
            </CardContent>
          </Card>

          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Participants</span>
                  </div>
                  <span className="font-semibold">
                    {groupe.participants_count || 0} / {groupe.capacite_max || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Capacité max</span>
                  </div>
                  <span className="font-semibold">
                    {groupe.capacite_max || 'Non définie'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le groupe "{groupe.libelle}" ?
              Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => setDeleteModal({ show: false, groupe: null })}
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
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

export default GroupeDetail;
