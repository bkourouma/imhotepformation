import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCompanySession } from '../../hooks/useCompanySession';
import { useEntrepriseAuth } from '../../hooks/useEntrepriseAuth';
import { groupesService, employesService, participantsService, entreprisesService } from '../../services/api';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { ArrowLeft, Save, Users, Building2 } from 'lucide-react';

const ParticipantForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupeId } = useParams();
  const { selectedCompany } = useCompanySession();
  const { isAuthenticated: isEntreprise } = useEntrepriseAuth();

  // Determine if we're in enterprise portal
  const isEntreprisePortal = location.pathname.startsWith('/entreprise');
  // If entreprise portal, block access to add participants
  useEffect(() => {
    if (isEntreprisePortal) {
      navigate('/entreprise/formations');
    }
  }, [isEntreprisePortal, navigate]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const [groupe, setGroupe] = useState(null);
  const [entreprises, setEntreprises] = useState([]);
  const [selectedEntreprise, setSelectedEntreprise] = useState('');
  const [employes, setEmployes] = useState([]);
  const [selectedEmployes, setSelectedEmployes] = useState([]);
  const [existingParticipants, setExistingParticipants] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, [groupeId]);

  useEffect(() => {
    if (selectedEntreprise) {
      loadEmployes();
    } else {
      setEmployes([]);
      setSelectedEmployes([]);
    }
  }, [selectedEntreprise]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // Load groupe details and entreprises
      const [groupeResponse, entreprisesResponse] = await Promise.all([
        groupesService.getById(groupeId),
        entreprisesService.getAll()
      ]);

      setGroupe(groupeResponse);
      setEntreprises(entreprisesResponse || []);

      // Load existing participants
      const participantsResponse = await groupesService.getWithParticipants(groupeId);
      if (participantsResponse && participantsResponse.participants) {
        setExistingParticipants(participantsResponse.participants);
      }

    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployes = async () => {
    try {
      // Load employes for selected entreprise
      const employesResponse = await employesService.getAll({
        entreprise_id: selectedEntreprise
      });
      setEmployes(employesResponse || []);

      // Pre-select existing participants for this entreprise
      const existingEmployeIds = existingParticipants
        .filter(p => p.entreprise_id === parseInt(selectedEntreprise))
        .map(p => p.employe_id);
      setSelectedEmployes(existingEmployeIds);

      console.log('Existing participants:', existingParticipants);
      console.log('Selected entreprise:', selectedEntreprise);
      console.log('Pre-selected employee IDs:', existingEmployeIds);

    } catch (err) {
      setError('Erreur lors du chargement des employés');
      console.error('Erreur:', err);
    }
  };

  const handleEmployeToggle = (employeId) => {
    setSelectedEmployes(prev => {
      if (prev.includes(employeId)) {
        return prev.filter(id => id !== employeId);
      } else {
        return [...prev, employeId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedEntreprise) {
      setError('Veuillez sélectionner une entreprise');
      return;
    }

    if (selectedEmployes.length === 0) {
      setError('Veuillez sélectionner au moins un employé');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Create participants for selected employes
      const participants = selectedEmployes.map(employeId => ({
        employe_id: employeId,
        groupe_id: parseInt(groupeId),
        present: false
      }));

      await participantsService.createBulk({ participants });

      navigate(isEntreprisePortal ? `/entreprise/groupes/${groupeId}` : `/groupes/${groupeId}`);
    } catch (err) {
      setError('Erreur lors de la sauvegarde des participants');
      console.error('Erreur:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!groupe) {
    return <ErrorMessage message="Groupe non trouvé" />;
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(isEntreprisePortal ? `/entreprise/groupes/${groupeId}` : `/groupes/${groupeId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ajouter des participants</h1>
            <div className="text-gray-600 space-y-1">
              <p className="text-sm">
                <span className="font-medium">Formation:</span> {groupe.formation_nom || 'Non définie'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Séance:</span> {groupe.seance_nom || 'Non définie'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Groupe:</span> {groupe.libelle || 'Non défini'}
              </p>
            </div>
          </div>
        </div>

        {error && <ErrorMessage message={error} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Enterprise Selector */}
          <Card>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">Sélectionner l'entreprise</h2>
              </div>

              <div>
                <label htmlFor="entreprise" className="block text-sm font-medium text-gray-700 mb-2">
                  Entreprise
                </label>
                <select
                  id="entreprise"
                  value={selectedEntreprise}
                  onChange={(e) => setSelectedEntreprise(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner une entreprise...</option>
                  {entreprises.map((entreprise) => (
                    <option key={entreprise.id} value={entreprise.id}>
                      {entreprise.raison_sociale}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Employees Selector */}
          {selectedEntreprise && (
            <Card>
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">Sélectionner les employés</h2>
                </div>

                <div className="grid gap-4">
                {employes.map((employe) => {
                  const isSelected = selectedEmployes.includes(employe.id);
                  const isExisting = existingParticipants.some(p => p.employe_id === employe.id);
                  
                  return (
                    <div
                      key={employe.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isExisting ? 'opacity-60' : ''}`}
                      onClick={() => !isExisting && handleEmployeToggle(employe.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => !isExisting && handleEmployeToggle(employe.id)}
                              disabled={isExisting}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {employe.prenom} {employe.nom}
                              </h3>
                              <p className="text-sm text-gray-600">{employe.fonction}</p>
                              <p className="text-sm text-gray-500">{employe.email}</p>
                            </div>
                          </div>
                        </div>
                        {isExisting && (
                          <span className="text-sm text-green-600 font-medium">
                            Déjà inscrit
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                </div>

                {employes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Aucun employé trouvé pour cette entreprise</p>
                    <p className="text-sm">Ajoutez d'abord des employés dans la section Employés</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(isEntreprisePortal ? `/entreprise/groupes/${groupeId}` : `/groupes/${groupeId}`)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={saving || !selectedEntreprise || selectedEmployes.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Sauvegarde...' : `Ajouter ${selectedEmployes.length} participant(s)`}
            </Button>
          </div>
        </form>
      </div>
    );
};

export default ParticipantForm; 