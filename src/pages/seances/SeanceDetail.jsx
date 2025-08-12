import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, Clock, MapPin, Users } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import SeanceMedia from '../../components/seances/SeanceMedia';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { seancesService } from '../../services/api';
import { dateUtils } from '../../utils/helpers';

const SeanceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated: isAdmin } = useAdminAuth();
  
  // Determine if we're in admin section
  const isAdminSection = location.pathname.startsWith('/admin');
  const backPath = isAdminSection ? '/admin/seances' : '/seances';
  const [seance, setSeance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, seance: null });

  useEffect(() => {
    loadSeance();
  }, [id]);

  const loadSeance = async () => {
    try {
      setLoading(true);
      const response = await seancesService.getById(id);
      setSeance(response);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement de la séance');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await seancesService.delete(id);
      setDeleteModal({ show: false, seance: null });
      navigate(backPath);
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

  const getStatusBadge = (seance) => {
    const now = new Date();
    const startDate = seance?.date_debut ? new Date(seance.date_debut) : null;
    const endDate = seance?.date_fin ? new Date(seance.date_fin) : null;
    
    if (!startDate || !endDate) return 'Non défini';
    
    if (now < startDate) {
      return <span className="text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm font-medium">À venir</span>;
    } else if (now >= startDate && now <= endDate) {
      return <span className="text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm font-medium">En cours</span>;
    } else {
      return <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">Terminé</span>;
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

  if (!seance) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Séance non trouvée</p>
        <Button as={Link} to={backPath} className="mt-4">
          Retour aux séances
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
            onClick={() => navigate(backPath)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {seance.description || seance.intitule || 'Séance'}
            </h1>
            <p className="text-gray-600">
              {seance.formation_nom || 'Formation'}
            </p>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex gap-2">
            <Button
              as={Link}
              to={`${id}/edit`}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Modifier
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteModal({ show: true, seance })}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Supprimer
            </Button>
          </div>
        )}
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
          {/* Détails de la séance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Détails de la séance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Formation</label>
                  <p className="text-gray-900">{seance.formation_nom || 'Non définie'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-900">{seance.description || seance.intitule || 'Aucune description'}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date de début</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {formatDate(seance.date_debut)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date de fin</label>
                    <p className="text-gray-900 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {formatDate(seance.date_fin)}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Lieu</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {seance.lieu || 'Non défini'}
                  </p>
                </div>
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
                {getStatusBadge(seance)}
              </div>
            </CardContent>
          </Card>

          {/* Informations */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Capacité</span>
                  </div>
                  <span className="font-semibold">
                    {seance.capacite_max || seance.capacite || 'Non définie'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Durée</span>
                  </div>
                  <span className="font-semibold">
                    {seance.duree ? `${seance.duree}h` : 'Non définie'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Seance Media */}
      <SeanceMedia seanceId={id} seance={seance} />

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer la séance "{seance.description || seance.intitule}" ?
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

export default SeanceDetail;
