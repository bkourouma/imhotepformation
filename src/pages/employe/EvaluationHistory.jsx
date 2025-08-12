import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, XCircle, TrendingUp, Calendar, Eye } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { useEmployeAuth } from '../../hooks/useEmployeAuth.jsx';
import { employeApi } from '../../services/employeApi.js';
import { dateUtils } from '../../utils/helpers';

export default function EvaluationHistory() {
  const { seanceId } = useParams();
  const navigate = useNavigate();
  const { employe } = useEmployeAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        setError('');

        const attemptsData = await employeApi.getEvaluationAttempts(employe.id, 100);
        // Filter attempts for this specific seance if seanceId is provided
        const filteredAttempts = seanceId 
          ? attemptsData.filter(attempt => attempt.seance_id === parseInt(seanceId))
          : attemptsData;
        setAttempts(filteredAttempts);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (employe) {
      fetchAttempts();
    }
  }, [employe, seanceId]);

  const handleBack = () => {
    if (seanceId) {
      navigate(`/employe/evaluations/${seanceId}`);
    } else {
      navigate('/employe/dashboard');
    }
  };

  const handleViewDetails = (attemptId) => {
    navigate(`/employe/evaluations/review/${attemptId}`);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (percentage) => {
    if (percentage >= 70) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
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
                Historique des évaluations
              </h1>
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
                  Vos performances
                </h2>
                <p className="text-gray-600">
                  Consultez l'historique de vos évaluations et suivez vos progrès
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          {attempts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{attempts.length}</div>
                    <div className="text-sm text-gray-500">Total des tentatives</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {attempts.filter(a => a.pourcentage >= 70).length}
                    </div>
                    <div className="text-sm text-gray-500">Réussites (≥70%)</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {attempts.length > 0 
                        ? (attempts.reduce((sum, a) => sum + a.pourcentage, 0) / attempts.length).toFixed(1)
                        : 0
                      }%
                    </div>
                    <div className="text-sm text-gray-500">Moyenne générale</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {attempts.length > 0 
                        ? Math.max(...attempts.map(a => a.pourcentage)).toFixed(1)
                        : 0
                      }%
                    </div>
                    <div className="text-sm text-gray-500">Meilleur score</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Attempts List */}
          {attempts.length === 0 ? (
            <Card>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Aucune tentative d'évaluation trouvée
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {attempts.map((attempt) => (
                <Card key={attempt.id} className="hover:shadow-lg transition-shadow">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getScoreIcon(attempt.pourcentage)}
                          <h3 className="text-lg font-semibold text-gray-900">
                            {attempt.evaluation_titre}
                          </h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">
                          {attempt.formation_nom} - {attempt.seance_description}
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Score:</span>
                            <span className={`ml-2 font-semibold ${getScoreColor(attempt.pourcentage)}`}>
                              {attempt.pourcentage.toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Points:</span>
                            <span className="ml-2 font-semibold">
                              {attempt.score}/{attempt.total_points}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Temps:</span>
                            <span className="ml-2 font-semibold">
                              {formatTime(attempt.temps_utilise)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Date:</span>
                            <span className="ml-2 font-semibold">
                              {dateUtils.format(attempt.date_debut)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 ml-4">
                        <div className={`text-2xl font-bold ${getScoreColor(attempt.pourcentage)}`}>
                          {attempt.pourcentage.toFixed(0)}%
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(attempt.id)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Voir détails
                        </Button>
                      </div>
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
