import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCompanySession } from '../../hooks/useCompanySession';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useEntrepriseAuth } from '../../hooks/useEntrepriseAuth';
import * as api from '../../services/api';
import Layout from '../../components/shared/Layout';
import Card from '../../components/shared/Card';
import Table from '../../components/shared/Table';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { Plus, Search, Edit, Trash2, Eye, Users, UserPlus, ChevronDown, ChevronRight, Calendar, Clock, MapPin } from 'lucide-react';

const GroupesList = () => {
  const location = useLocation();
  const { selectedCompany } = useCompanySession();
  const { isAuthenticated: isAdmin } = useAdminAuth();
  const { isAuthenticated: isEntreprise } = useEntrepriseAuth();

  // Determine if we're in enterprise portal
  const isEntreprisePortal = location.pathname.startsWith('/entreprise');
  const showAdminActions = isAdmin && !isEntreprisePortal;
  const [formations, setFormations] = useState([]);
  const [selectedFormation, setSelectedFormation] = useState('');
  const [seances, setSeances] = useState([]);
  const [expandedSeances, setExpandedSeances] = useState(new Set());
  const [groupesBySeance, setGroupesBySeance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, groupe: null });

  useEffect(() => {
    loadFormations();
  }, []);

  useEffect(() => {
    if (selectedFormation) {
      loadSeances();
    } else {
      setSeances([]);
      setGroupesBySeance({});
    }
  }, [selectedFormation]);

  const loadFormations = async () => {
    try {
      setLoading(true);
      console.log('api.formationsService:', api.formationsService);
      console.log('api.formationsService.getAll:', api.formationsService.getAll);
      const response = await api.formationsService.getAll();
      console.log('Formations loaded:', response);
      setFormations(response || []);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des formations');
      console.error('Erreur loadFormations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSeances = async () => {
    try {
      setLoading(true);
      console.log('api.seancesService:', api.seancesService);
      console.log('api.seancesService.getAll:', api.seancesService.getAll);
      const response = await api.seancesService.getAll({ formation_id: selectedFormation });
      console.log('Seances loaded:', response);
      setSeances(response || []);
      setExpandedSeances(new Set());
      setGroupesBySeance({});
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des séances');
      console.error('Erreur loadSeances:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupesForSeance = async (seanceId) => {
    try {
      const response = await api.groupesService.getAll({ seance_id: seanceId });
      setGroupesBySeance(prev => ({
        ...prev,
        [seanceId]: response || []
      }));
    } catch (err) {
      console.error('Erreur lors du chargement des groupes:', err);
    }
  };

  const toggleSeanceExpansion = (seanceId) => {
    const newExpanded = new Set(expandedSeances);
    if (newExpanded.has(seanceId)) {
      newExpanded.delete(seanceId);
    } else {
      newExpanded.add(seanceId);
      // Load groups for this seance if not already loaded
      if (!groupesBySeance[seanceId]) {
        loadGroupesForSeance(seanceId);
      }
    }
    setExpandedSeances(newExpanded);
  };

  const handleDelete = async (groupe) => {
    try {
      await api.groupesService.delete(groupe.id);
      setDeleteModal({ show: false, groupe: null });
      // Reload groups for the affected seance
      if (groupe.seance_id) {
        loadGroupesForSeance(groupe.seance_id);
      }
    } catch (err) {
      setError('Erreur lors de la suppression du groupe');
      console.error('Erreur:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (groupe) => {
    const participantsCount = groupe?.participants_count || 0;
    const capacite = groupe?.capacite_max || 0;

    if (participantsCount >= capacite) {
      return <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs">Complet</span>;
    } else if (participantsCount > 0) {
      return <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs">Partiellement rempli</span>;
    } else {
      return <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs">Disponible</span>;
    }
  };

  // Helper function to generate appropriate routes based on context
  const getGroupeRoute = (groupeId) => {
    if (isEntreprisePortal) {
      return `/entreprise/groupes/${groupeId}`;
    }
    return `/groupes/${groupeId}`;
  };

  const getParticipantsRoute = (groupeId) => {
    if (isEntreprisePortal) {
      return `/entreprise/groupes/${groupeId}/participants`;
    }
    return `/groupes/${groupeId}/participants`;
  };

  const getEditRoute = (groupeId) => {
    if (isEntreprisePortal) {
      return `/entreprise/groupes/${groupeId}/edit`;
    }
    return `/groupes/${groupeId}/edit`;
  };

  const getNewGroupeRoute = (seanceId) => {
    if (isEntreprisePortal) {
      return `/entreprise/groupes/new?seance_id=${seanceId}`;
    }
    return isAdmin ? `/admin/groupes/new?seance_id=${seanceId}` : `/groupes/new?seance_id=${seanceId}`;
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
        <div className="flex items-center gap-3">
          {isEntreprisePortal && (
            <Button as={Link} to="/entreprise/dashboard" variant="secondary">
              Retour
            </Button>
          )}
          <div>
          <h1 className="text-2xl font-bold text-gray-900">Groupes</h1>
          <p className="text-gray-600">
            {isEntreprisePortal ? 'Consultez les groupes de formation' : (isAdmin ? 'Gérez les groupes de formation' : 'Consultez les groupes de formation')}
          </p>
          </div>
        </div>
        {showAdminActions && (
          <Button as={Link} to="/admin/groupes/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau groupe
          </Button>
        )}
      </div>

      {/* Formation Selector */}
      <Card>
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner une formation
          </label>
          <select
            value={selectedFormation}
            onChange={(e) => setSelectedFormation(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Choisir une formation...</option>
            {formations.map((formation) => (
              <option key={formation.id} value={formation.id}>
                {formation.intitule}
              </option>
            ))}
          </select>
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

      {/* Seances and Groups */}
      {selectedFormation && (
        <div className="space-y-4">
          {seances.length > 0 ? (
            seances.map((seance) => (
              <Card key={seance.id}>
                <div className="p-4">
                  {/* Seance Header */}
                  <div
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-4 p-4 rounded-lg"
                    onClick={() => toggleSeanceExpansion(seance.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1"
                      >
                        {expandedSeances.has(seance.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {seance.description || seance.intitule}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(seance.date_debut)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {seance.duree}h
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {seance.lieu}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {groupesBySeance[seance.id]?.length || 0} groupe(s)
                      </span>
                      {showAdminActions && (
                        <Button
                          as={Link}
                          to={getNewGroupeRoute(seance.id)}
                          variant="outline"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Ajouter groupe
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Groups List */}
                  {expandedSeances.has(seance.id) && (
                    <div className="mt-4 border-t pt-4">
                      {groupesBySeance[seance.id]?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {groupesBySeance[seance.id].map((groupe) => (
                            <div key={groupe.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-gray-900">{groupe.libelle}</h4>
                                {getStatusBadge(groupe)}
                              </div>

                              <div className="text-sm text-gray-600 mb-3 space-y-1">
                                <div>
                                  {groupe.participants_count || 0} / {groupe.capacite_max || 0} participants
                                </div>
                                {(groupe.enseignant_nom || groupe.enseignant_prenom) && (
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {groupe.enseignant_prenom} {groupe.enseignant_nom}
                                  </div>
                                )}
                                {groupe.date_debut && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(groupe.date_debut)}
                                    {groupe.date_fin && ` - ${formatDate(groupe.date_fin)}`}
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  as={Link}
                                  to={getGroupeRoute(groupe.id)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                {showAdminActions && (
                                  <Button
                                    as={Link}
                                    to={getParticipantsRoute(groupe.id)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <UserPlus className="h-3 w-3" />
                                  </Button>
                                )}
                                {showAdminActions && (
                                  <>
                                    <Button
                                      as={Link}
                                      to={getEditRoute(groupe.id)}
                                      variant="outline"
                                      size="sm"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setDeleteModal({ show: true, groupe })}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Aucun groupe pour cette séance</p>
                          {showAdminActions && (
                            <Button
                              as={Link}
                              to={getNewGroupeRoute(seance.id)}
                              variant="outline"
                              className="mt-2"
                            >
                              Créer le premier groupe
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Aucune séance pour cette formation</p>
              </div>
            </Card>
          )}
        </div>
      )}

      {!selectedFormation && (
        <Card>
          <div className="text-center py-12 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Sélectionnez une formation</h3>
            <p>Choisissez une formation ci-dessus pour voir ses séances et groupes</p>
          </div>
        </Card>
      )}

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirmer la suppression</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le groupe "{deleteModal.groupe?.libelle}" ?
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
                onClick={() => handleDelete(deleteModal.groupe)}
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

export default GroupesList; 