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
  Eye
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { dashboardService } from '../../services/api';
import { dateUtils, formatUtils } from '../../utils/helpers';

function StatCard({ title, value, icon: Icon, color = 'primary', trend, link }) {
  const colorClasses = {
    primary: 'bg-orange-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
  };

  const CardComponent = link ? Link : 'div';
  const cardProps = link ? { to: link } : {};

  return (
    <CardComponent {...cardProps}>
      <Card className={link ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}>
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
            {link && (
              <div className="ml-2">
                <Eye className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </CardComponent>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await dashboardService.getData();
        setData(dashboardData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrateur</h1>
          <p className="text-gray-600">Vue d'ensemble de la plateforme de formations</p>
        </div>
        <div className="flex gap-3">
          <Button as={Link} to="/admin/formations/new" variant="secondary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle formation
          </Button>
          <Button as={Link} to="/admin/entreprises/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle entreprise
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Formations"
          value={formatUtils.number(stats.totalFormations || 0)}
          icon={BookOpen}
          color="primary"
          link="/admin/formations"
        />
        <StatCard
          title="Entreprises Inscrites"
          value={formatUtils.number(stats.totalEntreprises || 0)}
          icon={Building2}
          color="green"
          link="/admin/entreprises"
        />
        <StatCard
          title="Total Inscriptions"
          value={formatUtils.number(stats.totalInscriptions || 0)}
          icon={UserCheck}
          color="orange"
          link="/admin/inscriptions"
        />
        <StatCard
          title="Total Participants"
          value={formatUtils.number(stats.totalParticipants || 0)}
          icon={Users}
          color="purple"
          trend={`+${stats.inscriptionsCeMois || 0} ce mois`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inscriptions récentes */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Inscriptions récentes</CardTitle>
              <Button 
                as={Link} 
                to="/admin/inscriptions" 
                variant="ghost" 
                size="sm"
              >
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {inscriptionsRecentes.length > 0 ? (
              <div className="space-y-4">
                {inscriptionsRecentes.map((inscription) => (
                  <div key={inscription.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {inscription.entreprise_nom}
                      </p>
                      <p className="text-sm text-gray-600">
                        {inscription.formation_intitule}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {inscription.nombre_participants} participants
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {dateUtils.format(inscription.date_souhaitee)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Button
                        as={Link}
                        to={`/admin/inscriptions/${inscription.id}`}
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
              <p className="text-gray-500 text-center py-4">
                Aucune inscription récente
              </p>
            )}
          </CardContent>
        </Card>

        {/* Formations populaires */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Formations populaires</CardTitle>
              <Button 
                as={Link} 
                to="/admin/formations" 
                variant="ghost" 
                size="sm"
              >
                Voir tout
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formationsPopulaires.length > 0 ? (
              <div className="space-y-4">
                {formationsPopulaires.map((formation) => (
                  <div key={formation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {formation.intitule}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatUtils.truncate(formation.cible, 60)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
                        {formation.inscription_count || 0} inscriptions
                      </p>
                      <Button
                        as={Link}
                        to={`/admin/formations/${formation.id}`}
                        variant="ghost"
                        size="sm"
                      >
                        Gérer
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

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              as={Link}
              to="/admin/formations/new"
              variant="secondary"
              className="flex items-center justify-center gap-2 h-20"
            >
              <BookOpen className="h-6 w-6" />
              <div className="text-left">
                <div className="font-medium">Créer une formation</div>
                <div className="text-sm text-gray-600">Ajouter une nouvelle formation</div>
              </div>
            </Button>
            
            <Button
              as={Link}
              to="/admin/entreprises/new"
              variant="secondary"
              className="flex items-center justify-center gap-2 h-20"
            >
              <Building2 className="h-6 w-6" />
              <div className="text-left">
                <div className="font-medium">Ajouter une entreprise</div>
                <div className="text-sm text-gray-600">Enregistrer une nouvelle entreprise</div>
              </div>
            </Button>
            
            <Button
              as={Link}
              to="/admin/reports"
              variant="secondary"
              className="flex items-center justify-center gap-2 h-20"
            >
              <TrendingUp className="h-6 w-6" />
              <div className="text-left">
                <div className="font-medium">Voir les rapports</div>
                <div className="text-sm text-gray-600">Analyser les statistiques</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
