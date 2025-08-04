import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  UserCheck,
  Users,
  TrendingUp,
  Calendar,
  Plus,
  Award,
  LogOut
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/shared/Card';
import Button from '../components/shared/Button';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import WelcomeGuide from '../components/shared/WelcomeGuide';
import { useCompanySession } from '../hooks/useCompanySession.jsx';
import { useAdminAuth } from '../hooks/useAdminAuth.jsx';
import { dashboardService, inscriptionsService, formationsService } from '../services/api';
import { dateUtils, formatUtils } from '../utils/helpers';

function StatCard({ title, value, icon: Icon, color = 'primary', trend }) {
  const colorClasses = {
    primary: 'bg-orange-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
  };

  return (
    <Card>
      <CardContent>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className="flex items-center mt-1">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">{trend}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { selectedCompany } = useCompanySession();
  const { isAuthenticated: isAdmin, logout: adminLogout } = useAdminAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleAdminLogout = () => {
    adminLogout();
    window.location.reload();
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Récupérer les données - filtrer par entreprise si pas admin
        const entrepriseId = !isAdmin && selectedCompany ? selectedCompany.id : null;

        const [dashboardData, companyInscriptions, allFormations] = await Promise.all([
          dashboardService.getData(entrepriseId),
          selectedCompany ? inscriptionsService.getAll({ entreprise_id: selectedCompany.id }) : Promise.resolve([]),
          formationsService.getAll()
        ]);

        setData({
          ...dashboardData,
          companyInscriptions,
          allFormations
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedCompany, isAdmin]);

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
        title="Erreur lors du chargement du tableau de bord"
      />
    );
  }

  const stats = data?.stats || {};
  const inscriptionsRecentes = data?.inscriptionsRecentes || [];
  const formationsPopulaires = data?.formationsPopulaires || [];
  const companyInscriptions = data?.companyInscriptions || [];
  const allFormations = data?.allFormations || [];

  // Statistiques spécifiques à l'entreprise
  const companyStats = {
    totalInscriptions: companyInscriptions.length,
    totalParticipants: companyInscriptions.reduce((sum, inscription) => sum + inscription.nombre_participants, 0),
    formationsUniques: new Set(companyInscriptions.map(i => i.formation_id)).size,
    prochaineDateFormation: companyInscriptions
      .filter(i => new Date(i.date_souhaitee) >= new Date())
      .sort((a, b) => new Date(a.date_souhaitee) - new Date(b.date_souhaitee))[0]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">
            {selectedCompany ?
              `Bienvenue ${selectedCompany.raison_sociale} - Gérez vos formations` :
              'Vue d\'ensemble de votre activité formations'
            }
          </p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <Button as={Link} to="/formations" variant="secondary" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Voir les formations
            </Button>
          )}
          <Button as={Link} to="/inscriptions/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle inscription
          </Button>
        </div>
      </div>

      {/* Notification mode admin */}
      {isAdmin && selectedCompany && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">ℹ️</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900">Mode Administrateur</h3>
              <p className="text-sm text-blue-700 mt-1">
                Vous êtes connecté en tant qu'administrateur et voyez toutes les données.
                Pour tester le filtrage par entreprise, déconnectez-vous du mode admin.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleAdminLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Quitter Admin
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques de l'entreprise */}
      {selectedCompany && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Mes Inscriptions"
            value={formatUtils.number(companyStats.totalInscriptions)}
            icon={UserCheck}
            color="primary"
          />
          <StatCard
            title="Mes Participants"
            value={formatUtils.number(companyStats.totalParticipants)}
            icon={Users}
            color="green"
          />
          <StatCard
            title="Formations Suivies"
            value={formatUtils.number(companyStats.formationsUniques)}
            icon={Award}
            color="orange"
          />
          <StatCard
            title="Prochaine Formation"
            value={companyStats.prochaineDateFormation ?
              dateUtils.format(companyStats.prochaineDateFormation.date_souhaitee, 'dd/MM') :
              'Aucune'
            }
            icon={Calendar}
            color="purple"
          />
        </div>
      )}

      {/* Statistiques générales (seulement pour les admins) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Formations Disponibles"
            value={formatUtils.number(allFormations.length)}
            icon={BookOpen}
            color="primary"
          />
          <StatCard
            title="Entreprises Inscrites"
            value={formatUtils.number(stats.totalEntreprises || 0)}
            icon={Building2}
            color="green"
          />
          <StatCard
            title="Total Inscriptions"
            value={formatUtils.number(stats.totalInscriptions || 0)}
            icon={UserCheck}
            color="orange"
          />
          <StatCard
            title="Total Participants"
            value={formatUtils.number(stats.totalParticipants || 0)}
            icon={Users}
            color="purple"
            trend={`+${stats.inscriptionsCeMois || 0} ce mois`}
          />
        </div>
      )}

      {/* Guide d'accueil pour les nouvelles entreprises */}
      {selectedCompany && companyStats.totalInscriptions === 0 && (
        <WelcomeGuide companyName={selectedCompany.raison_sociale} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mes inscriptions */}
        {selectedCompany && companyStats.totalInscriptions > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Mes inscriptions</CardTitle>
                <Button
                  as={Link}
                  to="/inscriptions"
                  variant="ghost"
                  size="sm"
                >
                  Voir tout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {companyInscriptions.length > 0 ? (
                <div className="space-y-4">
                  {companyInscriptions.slice(0, 5).map((inscription) => (
                    <div key={inscription.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {inscription.formation_intitule || 'Formation inconnue'}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {inscription.nombre_participants || 0} participants
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {inscription.date_souhaitee ? dateUtils.format(inscription.date_souhaitee) : 'Date non définie'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Button
                          as={Link}
                          to={`/inscriptions/${inscription.id}`}
                          variant="ghost"
                          size="sm"
                        >
                          Voir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    Aucune inscription pour le moment
                  </p>
                  <Button as={Link} to="/inscriptions/new">
                    Créer ma première inscription
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Formations disponibles */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Formations disponibles</CardTitle>
              {isAdmin && (
                <Button
                  as={Link}
                  to="/formations"
                  variant="ghost"
                  size="sm"
                >
                  Voir tout
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {allFormations.length > 0 ? (
              <div className="space-y-4">
                {allFormations.slice(0, 5).map((formation) => (
                  <div key={formation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {formation.intitule || 'Formation sans titre'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatUtils.truncate(formation.cible || 'Aucune description disponible', 60)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Button
                        as={Link}
                        to={`/inscriptions/new?formation_id=${formation.id}`}
                        variant="ghost"
                        size="sm"
                        className="text-orange-600"
                      >
                        S'inscrire
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Aucune formation disponible
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
