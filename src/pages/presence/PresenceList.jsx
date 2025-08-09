import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Clock, Save, RotateCcw } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card from '../../components/shared/Card';
import { Input } from '../../components/shared/FormField';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import ExportButton from '../../components/shared/ExportButton';
import { 
  formationsService, 
  seancesService, 
  groupesService, 
  participantsService 
} from '../../services/api';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { dateUtils } from '../../utils/helpers';
import { columnConfigs } from '../../utils/excelExport';

const PresenceList = () => {
  const { isAuthenticated: isAdmin } = useAdminAuth();
  const [formations, setFormations] = useState([]);
  const [seances, setSeances] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [participants, setParticipants] = useState([]);
  
  const [selectedFormation, setSelectedFormation] = useState('');
  const [selectedSeance, setSelectedSeance] = useState('');
  const [selectedGroupe, setSelectedGroupe] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  
  const [presenceChanges, setPresenceChanges] = useState({});
  const [stats, setStats] = useState(null);

  // Load formations on component mount
  useEffect(() => {
    loadFormations();
  }, []);

  // Load seances when formation changes
  useEffect(() => {
    if (selectedFormation) {
      loadSeances(selectedFormation);
      setSelectedSeance('');
      setSelectedGroupe('');
      setParticipants([]);
      setPresenceChanges({});
    }
  }, [selectedFormation]);

  // Load groupes when seance changes
  useEffect(() => {
    if (selectedSeance) {
      loadGroupes(selectedSeance);
      setSelectedGroupe('');
      setParticipants([]);
      setPresenceChanges({});
    }
  }, [selectedSeance]);

  // Load participants when groupe changes
  useEffect(() => {
    if (selectedGroupe) {
      loadParticipants(selectedGroupe);
      setPresenceChanges({});
    }
  }, [selectedGroupe]);

  const loadFormations = async () => {
    try {
      const response = await formationsService.getAll();
      console.log('Formations loaded:', response);
      setFormations(response || []);
    } catch (err) {
      setError('Erreur lors du chargement des formations');
      console.error('Erreur:', err);
    }
  };

  const loadSeances = async (formationId) => {
    try {
      setLoading(true);
      const response = await seancesService.getAll({ formation_id: formationId });
      setSeances(response || []);
    } catch (err) {
      setError('Erreur lors du chargement des séances');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupes = async (seanceId) => {
    try {
      setLoading(true);
      const response = await groupesService.getBySeance(seanceId);
      setGroupes(response || []);
    } catch (err) {
      setError('Erreur lors du chargement des groupes');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async (groupeId) => {
    try {
      setLoading(true);
      const [participantsResponse, statsResponse] = await Promise.all([
        participantsService.getByGroupe(groupeId),
        participantsService.getPresenceStats(groupeId)
      ]);
      setParticipants(participantsResponse || []);
      setStats(statsResponse);
    } catch (err) {
      setError('Erreur lors du chargement des participants');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresenceChange = (participantId, present) => {
    setPresenceChanges(prev => ({
      ...prev,
      [participantId]: present
    }));
  };

  const getEffectivePresence = (participant) => {
    return presenceChanges.hasOwnProperty(participant.id) 
      ? presenceChanges[participant.id] 
      : Boolean(participant.present);
  };

  const markAllPresent = () => {
    const changes = {};
    participants.forEach(participant => {
      changes[participant.id] = true;
    });
    setPresenceChanges(changes);
  };

  const markAllAbsent = () => {
    const changes = {};
    participants.forEach(participant => {
      changes[participant.id] = false;
    });
    setPresenceChanges(changes);
  };

  const resetChanges = () => {
    setPresenceChanges({});
  };

  const savePresences = async () => {
    if (Object.keys(presenceChanges).length === 0) {
      setError('Aucune modification à sauvegarder');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const updates = Object.entries(presenceChanges).map(([participantId, present]) => ({
        participantId: parseInt(participantId),
        present
      }));

      await participantsService.updateMultiplePresence(updates);
      
      // Reload participants to get updated data
      await loadParticipants(selectedGroupe);
      setPresenceChanges({});
      setSuccess(`Présences mises à jour pour ${updates.length} participant(s)`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erreur lors de la sauvegarde des présences');
      console.error('Erreur:', err);
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = Object.keys(presenceChanges).length > 0;

  const getCurrentStats = () => {
    if (!participants.length) return { total: 0, present: 0, absent: 0 };
    
    let present = 0;
    participants.forEach(participant => {
      if (getEffectivePresence(participant)) {
        present++;
      }
    });
    
    return {
      total: participants.length,
      present,
      absent: participants.length - present
    };
  };

  const currentStats = getCurrentStats();

  // Helper function to generate export filename
  const getExportFilename = () => {
    const formation = formations.find(f => f.id == selectedFormation);
    const seance = seances.find(s => s.id == selectedSeance);
    const groupe = groupes.find(g => g.id == selectedGroupe);

    const parts = ['presence'];
    if (formation) parts.push(formation.intitule.replace(/[^a-zA-Z0-9]/g, '_'));
    if (seance) parts.push(seance.description.replace(/[^a-zA-Z0-9]/g, '_'));
    if (groupe) parts.push(groupe.libelle.replace(/[^a-zA-Z0-9]/g, '_'));

    return parts.join('_');
  };

  // Prepare export data with current presence status
  const getExportData = () => {
    return participants.map(participant => ({
      ...participant,
      present: getEffectivePresence(participant)
    }));
  };

  console.log('PresenceList render - formations:', formations);
  console.log('PresenceList render - formations.length:', formations.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liste de Présence</h1>
          <p className="text-gray-600 mt-1">
            Gérez les présences des participants aux formations
          </p>
        </div>

        {/* Quick Export - Only show when participants are loaded */}
        {participants.length > 0 && (
          <ExportButton
            data={getExportData()}
            columns={columnConfigs.presence}
            filename={getExportFilename()}
            sheetName="Liste de Présence"
            onExportComplete={(filename) => {
              console.log(`Export réussi: ${filename}`);
            }}
            onExportError={(error) => {
              console.error('Erreur d\'export:', error);
            }}
          >
            Exporter Excel
          </ExportButton>
        )}
      </div>

      {/* Current Selection Summary */}
      {(selectedFormation || selectedSeance || selectedGroupe) && (
        <Card>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Sélection actuelle</h3>
            <div className="space-y-1 text-sm text-blue-700">
              {selectedFormation && (
                <div>
                  <span className="font-medium">Formation:</span> {formations.find(f => f.id == selectedFormation)?.intitule}
                </div>
              )}
              {selectedSeance && (
                <div>
                  <span className="font-medium">Séance:</span> {seances.find(s => s.id == selectedSeance)?.description}
                </div>
              )}
              {selectedGroupe && (
                <div>
                  <span className="font-medium">Groupe:</span> {groupes.find(g => g.id == selectedGroupe)?.libelle}
                </div>
              )}
              {participants.length > 0 && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <span className="font-medium">Participants:</span> {currentStats.total} •
                  <span className="text-green-700"> Présents: {currentStats.present}</span> •
                  <span className="text-red-700"> Absents: {currentStats.absent}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Error and Success Messages */}
      {error && (
        <ErrorMessage 
          message={error} 
          onDismiss={() => setError(null)}
        />
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Selection Filters */}
      <Card>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Sélection</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Formation Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formation
              </label>
              <select
                value={selectedFormation}
                onChange={(e) => setSelectedFormation(e.target.value)}
                required
                className="form-input w-full"
              >
                <option value="">Sélectionner une formation</option>
                {formations.map(formation => (
                  <option key={formation.id} value={formation.id}>
                    {formation.intitule}
                  </option>
                ))}
              </select>
            </div>

            {/* Seance Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Séance
              </label>
              <select
                value={selectedSeance}
                onChange={(e) => setSelectedSeance(e.target.value)}
                disabled={!selectedFormation || loading}
                required
                className="form-input w-full"
              >
                <option value="">Sélectionner une séance</option>
                {seances.map(seance => (
                  <option key={seance.id} value={seance.id}>
                    {seance.description} - {dateUtils.format(seance.date_debut)}
                  </option>
                ))}
              </select>
            </div>

            {/* Groupe Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Groupe
              </label>
              <select
                value={selectedGroupe}
                onChange={(e) => setSelectedGroupe(e.target.value)}
                disabled={!selectedSeance || loading}
                required
                className="form-input w-full"
              >
                <option value="">Sélectionner un groupe</option>
                {groupes.map(groupe => (
                  <option key={groupe.id} value={groupe.id}>
                    {groupe.libelle} ({groupe.capacite_max} places)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <LoadingSpinner />
        </div>
      )}

      {/* Participants List */}
      {participants.length > 0 && (
        <Card>
          <div className="space-y-4">
            {/* Stats and Actions Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <h3 className="text-lg font-semibold">Participants</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>Total: {currentStats.total}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Présents: {currentStats.present}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>Absents: {currentStats.absent}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Export Button - Available to all users */}
                {participants.length > 0 && (
                  <ExportButton
                    data={getExportData()}
                    columns={columnConfigs.presence}
                    filename={getExportFilename()}
                    sheetName="Liste de Présence"
                    variant="outline"
                    size="sm"
                    onExportComplete={(filename) => {
                      console.log(`Export réussi: ${filename}`);
                    }}
                    onExportError={(error) => {
                      console.error('Erreur d\'export:', error);
                    }}
                  >
                    Exporter Excel
                  </ExportButton>
                )}

                {isAdmin && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={markAllPresent}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Tous présents
                    </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAbsent}
                    className="flex items-center gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    Tous absents
                  </Button>
                  {hasChanges && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetChanges}
                        className="flex items-center gap-1"
                      >
                        <RotateCcw className="h-4 w-4" />
                        Annuler
                      </Button>
                      <Button
                        onClick={savePresences}
                        disabled={saving}
                        className="flex items-center gap-1"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Sauvegarde...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Sauvegarder
                          </>
                        )}
                      </Button>
                    </>
                  )}
                  </>
                )}
              </div>
            </div>

            {/* Participants Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entreprise
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fonction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Présence
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {participants.map((participant) => {
                    const isPresent = getEffectivePresence(participant);
                    const hasChanged = presenceChanges.hasOwnProperty(participant.id);
                    
                    return (
                      <tr key={participant.id} className={hasChanged ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {participant.nom} {participant.prenom}
                            </div>
                            <div className="text-sm text-gray-500">
                              {participant.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {participant.entreprise_nom}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {participant.fonction || 'Non spécifiée'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {participant.telephone || 'Non spécifié'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {isAdmin ? (
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={isPresent}
                                onChange={(e) => handlePresenceChange(participant.id, e.target.checked)}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm">
                                {isPresent ? 'Présent' : 'Absent'}
                              </span>
                            </label>
                          ) : (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isPresent 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {isPresent ? 'Présent' : 'Absent'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && participants.length === 0 && selectedGroupe && (
        <Card>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun participant</h3>
            <p className="text-gray-600">
              Ce groupe n'a pas encore de participants inscrits.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PresenceList;
