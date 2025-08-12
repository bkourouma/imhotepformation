import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  CheckCircle,
  XCircle,
  Award,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import Button from '../../components/shared/Button';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { useEntrepriseAuth } from '../../hooks/useEntrepriseAuth';
import { dateUtils } from '../../utils/helpers';

export default function EvaluationsOverview() {
  const { entreprise } = useEntrepriseAuth();
  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, recent, passed, failed

  useEffect(() => {
    const fetchEvaluationData = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`/api/evaluations/analytics/enterprise/${entreprise.id}`);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données d\'évaluation');
        }

        const data = await response.json();

        // Provide default structure if data is incomplete
        const normalizedData = {
          attempts: data.attempts || [],
          statistics: data.statistics || {
            totalAttempts: 0,
            averageScore: 0,
            passRate: 0,
            completionRate: 0,
            averageTime: 0,
            scoreDistribution: { excellent: 0, good: 0, average: 0, poor: 0 }
          }
        };

        setEvaluationData(normalizedData);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (entreprise) {
      fetchEvaluationData();
    }
  }, [entreprise]);

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (percentage) => {
    if (percentage >= 70) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredAttempts = evaluationData?.attempts.filter(attempt => {
    switch (filter) {
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return new Date(attempt.created_at) >= oneWeekAgo;
      case 'passed':
        return attempt.pourcentage >= 70;
      case 'failed':
        return attempt.pourcentage < 70;
      default:
        return true;
    }
  }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement des évaluations..." />
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

  const { statistics } = evaluationData || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button as={Link} to="/entreprise/dashboard" variant="secondary">
                Retour
              </Button>
              <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Évaluations - {entreprise?.nom}
              </h1>
              <p className="text-gray-600">
                Vue d'ensemble des performances de vos employés
              </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exporter
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Évaluations</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statistics?.totalAttempts || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Score Moyen</p>
                    <p className={`text-2xl font-bold ${getScoreColor(statistics?.averageScore || 0)}`}>
                      {statistics?.averageScore?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Taux de Réussite</p>
                    <p className="text-2xl font-bold text-green-600">
                      {statistics?.passRate?.toFixed(1) || 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Temps Moyen</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatTime(statistics?.averageTime || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Score Distribution */}
          {statistics?.scoreDistribution && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Distribution des Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {statistics.scoreDistribution.excellent}
                    </div>
                    <div className="text-sm text-green-700">Excellent (90%+)</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {statistics.scoreDistribution.good}
                    </div>
                    <div className="text-sm text-blue-700">Bien (70-89%)</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {statistics.scoreDistribution.average}
                    </div>
                    <div className="text-sm text-yellow-700">Moyen (50-69%)</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {statistics.scoreDistribution.poor}
                    </div>
                    <div className="text-sm text-red-700">Faible (&lt;50%)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters and Evaluation List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Évaluations des Employés
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="all">Toutes</option>
                    <option value="recent">Récentes (7 jours)</option>
                    <option value="passed">Réussies</option>
                    <option value="failed">Échouées</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAttempts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune évaluation trouvée</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAttempts.map((attempt) => (
                    <div
                      key={attempt.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getScoreIcon(attempt.pourcentage)}
                            <h3 className="font-medium text-gray-900">
                              {attempt.employe_prenom} {attempt.employe_nom}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {attempt.employe_email}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Formation:</span>
                              <span className="ml-2 font-medium">{attempt.formation_nom}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Score:</span>
                              <span className={`ml-2 font-bold ${getScoreColor(attempt.pourcentage)}`}>
                                {attempt.pourcentage.toFixed(1)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Temps:</span>
                              <span className="ml-2 font-medium">
                                {formatTime(attempt.temps_utilise)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Date:</span>
                              <span className="ml-2 font-medium">
                                {dateUtils.format(attempt.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            Détails
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
