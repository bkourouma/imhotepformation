import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Clock, CheckCircle, XCircle, Play, History } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { useEmployeAuth } from '../../hooks/useEmployeAuth.jsx';
import { employeApi } from '../../services/employeApi.js';

export default function Evaluations() {
  const { seanceId } = useParams();
  const navigate = useNavigate();
  const { employe } = useEmployeAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingEvaluation, setCreatingEvaluation] = useState(false);
  const [validationInfo, setValidationInfo] = useState(null);
  const [validatingSeance, setValidatingSeance] = useState(false);

  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        setLoading(true);
        setError('');

        const evaluationsData = await employeApi.getEvaluationsBySeance(seanceId, employe.id);
        setEvaluations(evaluationsData);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const validateSeance = async () => {
      try {
        setValidatingSeance(true);
        const validation = await employeApi.validateSeanceForEvaluation(seanceId);
        setValidationInfo(validation);
      } catch (err) {
        console.warn('Erreur lors de la validation de la séance:', err);
        setValidationInfo({ valid: false, reason: 'Erreur de validation' });
      } finally {
        setValidatingSeance(false);
      }
    };

    if (employe && seanceId) {
      fetchEvaluations();
      validateSeance();
    }
  }, [employe, seanceId]);

  const handleCreateEvaluation = async () => {
    // Check validation before creating
    if (validationInfo && !validationInfo.valid) {
      setError(`Impossible de créer l'évaluation: ${validationInfo.reason}`);
      return;
    }

    try {
      setCreatingEvaluation(true);
      setError('');

      const evaluationData = await employeApi.createEvaluation({
        seance_id: parseInt(seanceId),
        employe_id: employe.id,
        titre: `Évaluation - Séance ${seanceId}`,
        description: 'Évaluation générée automatiquement par IA basée sur le contenu des documents',
        nombre_questions: 20,
        duree_minutes: 30
      });

      // Refresh evaluations list
      const evaluationsData = await employeApi.getEvaluationsBySeance(seanceId, employe.id);
      setEvaluations(evaluationsData);

      // Navigate to the new evaluation
      navigate(`/employe/evaluations/${seanceId}/take/${evaluationData.evaluation_id}`);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setCreatingEvaluation(false);
    }
  };

  const handleStartEvaluation = (evaluationId) => {
    navigate(`/employe/evaluations/${seanceId}/take/${evaluationId}`);
  };

  const handleViewHistory = () => {
    navigate(`/employe/evaluations/${seanceId}/history`);
  };

  const handleBack = () => {
    navigate('/employe/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        error={error} 
        onDismiss={() => setError('')}
        title="Erreur lors du chargement"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">
                Évaluations
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewHistory}
              >
                <History className="h-4 w-4 mr-2" />
                Historique
              </Button>
              <Button
                onClick={handleCreateEvaluation}
                disabled={creatingEvaluation}
              >
                {creatingEvaluation ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Créer une évaluation
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <Card>
            <CardContent>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Évaluations disponibles
                </h2>
                <p className="text-gray-600">
                  Testez vos connaissances avec nos évaluations générées par IA
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Evaluations List */}
          {evaluations.length === 0 ? (
            <Card>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    Aucune évaluation disponible pour le moment
                  </p>

                  {/* Validation Status */}
                  {validatingSeance ? (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span className="text-sm text-blue-700">Vérification du contenu de la séance...</span>
                      </div>
                    </div>
                  ) : validationInfo && !validationInfo.valid ? (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="text-red-600 mt-0.5">⚠️</div>
                        <div>
                          <h4 className="text-sm font-medium text-red-800 mb-2">
                            Impossible de créer une évaluation
                          </h4>
                          <p className="text-sm text-red-700 mb-3">
                            {validationInfo.reason}
                          </p>
                          {validationInfo.suggestions && (
                            <div>
                              <p className="text-sm font-medium text-red-800 mb-1">Suggestions:</p>
                              <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                                {validationInfo.suggestions.map((suggestion, index) => (
                                  <li key={index}>{suggestion}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : validationInfo && validationInfo.valid && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✅</span>
                        <span className="text-sm text-green-700">
                          Contenu détecté - Prêt pour la génération d'évaluation
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleCreateEvaluation}
                    disabled={creatingEvaluation || (validationInfo && !validationInfo.valid)}
                  >
                    {creatingEvaluation ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    {creatingEvaluation ? 'Génération en cours...' : 'Créer votre première évaluation'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {evaluations.map((evaluation) => (
                <Card key={evaluation.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{evaluation.titre}</span>
                      {evaluation.attempts && evaluation.attempts.length > 0 && (
                        <div className="flex items-center space-x-2">
                          {evaluation.attempts[0].pourcentage >= 70 ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-gray-600 text-sm">
                        {evaluation.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{evaluation.duree_minutes} min</span>
                        </div>
                        <div className="flex items-center">
                          <span>{evaluation.nombre_questions} questions</span>
                        </div>
                      </div>

                      {evaluation.attempts && evaluation.attempts.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">Dernière tentative:</span>
                            <span className={`font-bold ${
                              evaluation.attempts[0].pourcentage >= 70 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {evaluation.attempts[0].pourcentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(evaluation.attempts[0].date_debut).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={() => handleStartEvaluation(evaluation.id)}
                        className="w-full"
                        variant={evaluation.attempts && evaluation.attempts.length > 0 ? "outline" : "default"}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {evaluation.attempts && evaluation.attempts.length > 0 ? 'Recommencer' : 'Commencer'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
