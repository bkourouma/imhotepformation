import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, MapPin, FileText, LogOut, User, Play } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { useEmployeAuth } from '../../hooks/useEmployeAuth.jsx';
import { employeApi } from '../../services/employeApi.js';
import { dateUtils } from '../../utils/helpers';

export default function EmployeDashboard() {
  const navigate = useNavigate();
  const { employe, logout } = useEmployeAuth();
  const [formations, setFormations] = useState([]);
  const [seances, setSeances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [formationsData, seancesData] = await Promise.all([
          employeApi.getFormations(employe.id),
          employeApi.getSeances(employe.id)
        ]);

        setFormations(formationsData);
        setSeances(seancesData);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (employe) {
      fetchData();
    }
  }, [employe]);

  const handleLogout = () => {
    logout();
    navigate('/employe/login');
  };

  const handleSeanceClick = (seanceId) => {
    navigate(`/employe/seances/${seanceId}/media`);
  };

  const handleEvaluationClick = (seanceId) => {
    navigate(`/employe/evaluations/${seanceId}`);
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
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Mes Formations
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="h-5 w-5" />
                <span>{employe?.prenom} {employe?.nom}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <Card>
            <CardContent>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Bienvenue, {employe?.prenom} !
                </h2>
                <p className="text-gray-600">
                  Accédez à vos formations et séances de formation
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Formations Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Mes Formations
            </h3>
            
            {formations.length === 0 ? (
              <Card>
                <CardContent>
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Aucune formation disponible pour le moment
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {formations.map((formation) => (
                  <Card key={formation.formation_id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                        {formation.formation_nom}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        {formation.formation_cible}
                      </p>
                      
                      {/* Séances de cette formation */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Séances :</h4>
                        {seances
                          .filter(seance => seance.formation_id === formation.formation_id)
                          .map((seance) => (
                            <div
                              key={seance.seance_id}
                              className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleSeanceClick(seance.seance_id)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {seance.seance_description}
                                  </p>
                                  <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    <span>
                                      {dateUtils.format(seance.date_debut)}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    <span>{seance.lieu}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center text-sm text-gray-500">
                                    <FileText className="h-4 w-4 mr-1" />
                                    <span>{seance.media_count || 0} media</span>
                                  </div>
                                  {(seance.media_count > 0) && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEvaluationClick(seance.seance_id);
                                      }}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <Play className="h-3 w-3 mr-1" />
                                      Exerce toi
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
