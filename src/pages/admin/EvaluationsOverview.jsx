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
  Eye,
  Building2,
  BookOpen,
  Search
} from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { dateUtils } from '../../utils/helpers';

export default function AdminEvaluationsOverview() {
  const { isAuthenticated } = useAdminAuth();
  const [evaluationData, setEvaluationData] = useState(null);
  const [enterprises, setEnterprises] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    entreprise_id: '',
    formation_id: '',
    limit: 100
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch evaluation analytics
        const params = new URLSearchParams();
        if (filters.entreprise_id) params.append('entreprise_id', filters.entreprise_id);
        if (filters.formation_id) params.append('formation_id', filters.formation_id);
        params.append('limit', filters.limit);

        const [evaluationResponse, enterprisesResponse, formationsResponse] = await Promise.all([
          fetch(`/api/evaluations/analytics/admin?${params}`),
          fetch('/api/entreprises'),
          fetch('/api/formations')
        ]);

        if (!evaluationResponse.ok || !enterprisesResponse.ok || !formationsResponse.ok) {
          throw new Error('Erreur lors de la récupération des données');
        }

        const [evalData, entData, formData] = await Promise.all([
          evaluationResponse.json(),
          enterprisesResponse.json(),
          formationsResponse.json()
        ]);

        setEvaluationData(evalData);
        setEnterprises(entData);
        setFormations(formData);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, filters]);

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
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      attempt.employe_nom.toLowerCase().includes(searchLower) ||
      attempt.employe_prenom.toLowerCase().includes(searchLower) ||
      attempt.employe_email.toLowerCase().includes(searchLower) ||
      attempt.entreprise_nom.toLowerCase().includes(searchLower) ||
      attempt.formation_nom.toLowerCase().includes(searchLower)
    );
  }) || [];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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

  const { statistics, enterpriseBreakdown } = evaluationData || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Vue d'ensemble des Évaluations
              </h1>
              <p className="text-gray-600">
                Analyse globale des performances de toutes les entreprises
              </p>
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
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entreprise
                  </label>
                  <select
                    value={filters.entreprise_id}
                    onChange={(e) => handleFilterChange('entreprise_id', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Toutes les entreprises</option>
                    {enterprises.map(enterprise => (
                      <option key={enterprise.id} value={enterprise.id}>
                        {enterprise.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Formation
                  </label>
                  <select
                    value={filters.formation_id}
                    onChange={(e) => handleFilterChange('formation_id', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Toutes les formations</option>
                    {formations.map(formation => (
                      <option key={formation.id} value={formation.id}>
                        {formation.intitule}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limite
                  </label>
                  <select
                    value={filters.limit}
                    onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value={50}>50 résultats</option>
                    <option value={100}>100 résultats</option>
                    <option value={200}>200 résultats</option>
                    <option value={500}>500 résultats</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recherche
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nom, email, entreprise..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Global Statistics */}
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
                    <p className="text-sm font-medium text-gray-600">Score Moyen Global</p>
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
                    <p className="text-sm font-medium text-gray-600">Entreprises Actives</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {enterpriseBreakdown?.length || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enterprise Breakdown */}
          {enterpriseBreakdown && enterpriseBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Performance par Entreprise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {enterpriseBreakdown.map((enterprise, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-gray-900">
                          {enterprise.entrepriseName}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {enterprise.totalAttempts} évaluation(s)
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Score moyen:</span>
                          <span className={`ml-2 font-bold ${getScoreColor(enterprise.averageScore)}`}>
                            {enterprise.averageScore.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Taux de réussite:</span>
                          <span className="ml-2 font-bold text-green-600">
                            {enterprise.passRate.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Complétées:</span>
                          <span className="ml-2 font-bold">
                            {enterprise.completedAttempts}/{enterprise.totalAttempts}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Temps moyen:</span>
                          <span className="ml-2 font-bold">
                            {formatTime(enterprise.averageTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Score Distribution */}
          {statistics?.scoreDistribution && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Distribution Globale des Scores
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

          {/* Detailed Evaluation List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Évaluations Détaillées
                </CardTitle>
                <div className="text-sm text-gray-500">
                  {filteredAttempts.length} résultat(s) affiché(s)
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
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {attempt.entreprise_nom}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
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
                              <span className="text-gray-500">Points:</span>
                              <span className="ml-2 font-medium">
                                {attempt.score}/{attempt.total_points}
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
