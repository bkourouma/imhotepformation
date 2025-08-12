import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntrepriseAuth } from '../../hooks/useEntrepriseAuth';
import { Card, Button, LoadingSpinner } from '../../components/shared';
import { api } from '../../services/api';
import { dateUtils } from '../../utils/helpers';
import { BarChart3, Users, BookOpen } from 'lucide-react';

const EntrepriseDashboard = () => {
  const { entreprise, logout } = useEntrepriseAuth();
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFormations: 0,
    totalEmployes: 0,
    totalInscriptions: 0
  });

  useEffect(() => {
    if (entreprise) {
      loadDashboardData();
    }
  }, [entreprise]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les employés de l'entreprise
      const employesResponse = await api.get(`/employes?entreprise_id=${entreprise.id}`);
      setEmployes(employesResponse.data);

      // Charger les inscriptions de l'entreprise
      const inscriptionsResponse = await api.get(`/inscriptions?entreprise_id=${entreprise.id}`);
      setInscriptions(inscriptionsResponse.data);

      // Charger toutes les formations disponibles
      const formationsResponse = await api.get('/formations');
      setFormations(formationsResponse.data);

      // Calculer les statistiques
      setStats({
        totalFormations: formationsResponse.data.length,
        totalEmployes: employesResponse.data.length,
        totalInscriptions: inscriptionsResponse.data.length
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tableau de bord - {entreprise.raison_sociale}
              </h1>
              <p className="text-gray-600">Gérez vos formations et employés</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Connecté en tant que {entreprise.email}
              </span>
              <Button onClick={handleLogout} variant="outline">
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalFormations}</div>
              <div className="text-sm text-gray-600">Formations disponibles</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.totalEmployes}</div>
              <div className="text-sm text-gray-600">Employés</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.totalInscriptions}</div>
              <div className="text-sm text-gray-600">Inscriptions</div>
            </div>
          </Card>
        </div>

        {/* Navigation rapide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/entreprise/evaluations')}>
            <div className="p-6 text-center">
              <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Évaluations</h3>
              <p className="text-sm text-gray-600">Voir les performances de vos employés</p>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/entreprise/employes')}>
            <div className="p-6 text-center">
              <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Employés</h3>
              <p className="text-sm text-gray-600">Gérer vos employés et inscriptions</p>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/entreprise/formations')}>
            <div className="p-6 text-center">
              <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Formations</h3>
              <p className="text-sm text-gray-600">Parcourir les formations disponibles</p>
            </div>
          </Card>
        </div>

        {/* Informations de l'entreprise */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations de l'entreprise</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Raison sociale</label>
              <p className="mt-1 text-sm text-gray-900">{entreprise.raison_sociale}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{entreprise.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <p className="mt-1 text-sm text-gray-900">{entreprise.telephone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Adresse</label>
              <p className="mt-1 text-sm text-gray-900">{entreprise.adresse || 'Non renseignée'}</p>
            </div>
          </div>
        </Card>

        {/* Employés */}
        <Card className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Employés</h2>
            <Button onClick={() => navigate('/entreprise/employes')}>Gérer les employés</Button>
          </div>
          {employes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fonction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Téléphone
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employes.map((employe) => (
                    <tr key={employe.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employe.prenom} {employe.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employe.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employe.fonction}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employe.telephone}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucun employé enregistré</p>
          )}
        </Card>

        {/* Formations disponibles */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Formations disponibles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formations.map((formation) => (
              <div key={formation.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{formation.intitule}</h3>
                <p className="text-sm text-gray-600 mb-2">{formation.cible}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">{formation.duree}h</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Inscriptions */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Inscriptions</h2>
          {inscriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Formation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date d'inscription
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inscriptions.map((inscription, index) => (
                    <tr key={inscription.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {inscription.formation_intitule}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {dateUtils.format(inscription.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Aucune inscription</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EntrepriseDashboard;
