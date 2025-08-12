import { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Clock, User, GraduationCap } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from './Card';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { seancesService, groupesService } from '../../services/api';
import { dateUtils, formatUtils } from '../../utils/helpers';

function GroupeCard({ groupe }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadParticipants = async () => {
    if (expanded && participants.length === 0 && !loading) {
      try {
        setLoading(true);
        const data = await groupesService.getWithParticipants(groupe.id);
        setParticipants(data.participants || []);
      } catch (error) {
        console.error('Erreur lors du chargement des participants:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (expanded) {
      loadParticipants();
    }
  }, [expanded]);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-orange-500" />
          <span className="font-medium text-gray-900">
            {groupe.libelle || `Groupe ${groupe.id}`}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            {expanded ? 'Masquer' : 'Détails'}
          </button>
          <button
            onClick={() => window.location.href = `/admin/groupes/${groupe.id}`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Gérer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-gray-600">
          <User className="h-3 w-3" />
          <span>Capacité: {groupe.capacite_max || 'Non définie'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="h-3 w-3" />
          <span>Participants: {groupe.participants_count || 0}</span>
        </div>
        {groupe.enseignant_nom && (
          <div className="flex items-center gap-2 text-gray-600 col-span-2">
            <GraduationCap className="h-3 w-3" />
            <span>Enseignant: {groupe.enseignant_nom}</span>
          </div>
        )}
      </div>

      {groupe.date_debut && groupe.date_fin && (
        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-3 w-3" />
          <span>
            {dateUtils.format(groupe.date_debut)} - {dateUtils.format(groupe.date_fin)}
          </span>
        </div>
      )}

      {expanded && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Participants ({participants.length})
          </h4>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : participants.length > 0 ? (
            <div className="space-y-2">
              {participants.map((participant) => (
                <div 
                  key={participant.id} 
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div>
                    <span className="font-medium text-gray-900">
                      {participant.employe_prenom} {participant.employe_nom}
                    </span>
                    {participant.employe_fonction && (
                      <span className="text-sm text-gray-500 ml-2">
                        - {participant.employe_fonction}
                      </span>
                    )}
                  </div>
                  <div className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${participant.present 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}>
                    {participant.present ? 'Présent' : 'Non confirmé'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Aucun participant inscrit
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SeanceCard({ seance }) {
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const loadGroupes = async () => {
    if (expanded && groupes.length === 0 && !loading) {
      try {
        setLoading(true);
        const data = await groupesService.getBySeance(seance.id);
        setGroupes(data);
      } catch (error) {
        console.error('Erreur lors du chargement des groupes:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (expanded) {
      loadGroupes();
    }
  }, [expanded]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-500" />
            {seance.intitule || seance.description || `Séance ${seance.id}`}
          </CardTitle>
          <button
            onClick={() => setExpanded(!expanded)}
            className={`
              px-3 py-1 rounded-md text-sm font-medium transition-colors
              ${expanded 
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                : 'bg-orange-500 text-white hover:bg-orange-600'
              }
            `}
          >
{expanded ? 'Masquer groupes' : `Voir groupes (${seance.groupes_count || 0})`}
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <div>
              <div className="font-medium">Début: {dateUtils.formatDateTime(seance.date_debut)}</div>
              <div className="text-sm">Fin: {dateUtils.formatDateTime(seance.date_fin)}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{seance.lieu || 'Lieu non défini'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span>Capacité: {seance.capacite || 'Non définie'}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span>Groupes: {seance.groupes_count || 0}</span>
          </div>
        </div>

        {seance.description && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-1">Description</h4>
            <p className="text-sm text-gray-600">{seance.description}</p>
          </div>
        )}

        {expanded && (
          <div className="border-t border-gray-100 pt-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Groupes de cette séance
            </h4>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : groupes.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {groupes.map((groupe) => (
                  <GroupeCard key={groupe.id} groupe={groupe} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Aucun groupe créé pour cette séance
                </h4>
                <p className="text-gray-500 mb-4">
                  Les groupes permettent d'organiser les participants de cette séance.
                </p>
                <button
                  onClick={() => window.location.href = `/admin/groupes/new?seance_id=${seance.id}`}
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                >
                  Créer un groupe
                </button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SeancesPanels({ formation }) {
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeances = async () => {
      if (!formation) {
        setSeances([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await seancesService.getByFormation(formation.id);
        setSeances(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSeances();
  }, [formation]);

  if (!formation) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Sélectionnez une formation
        </h3>
        <p className="text-gray-500">
          Choisissez une formation ci-dessus pour voir ses séances et groupes
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        error={error} 
        onDismiss={() => setError(null)}
        title="Erreur lors du chargement des séances"
      />
    );
  }

  if (seances.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune séance trouvée
        </h3>
        <p className="text-gray-500">
          La formation "{formation.intitule}" n'a pas encore de séances planifiées
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Séances de "{formation.intitule}"
        </h2>
        <span className="text-sm text-gray-500">
          {seances.length} séance{seances.length > 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {seances.map((seance) => (
          <SeanceCard key={seance.id} seance={seance} />
        ))}
      </div>
    </div>
  );
}

export default SeancesPanels;
