import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';

export default function AdminUsers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p className="text-gray-600 mt-1">
          Gérez les comptes utilisateurs et leurs permissions
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Fonctionnalité en cours de développement
            </p>
            <p className="text-sm text-gray-400">
              Cette section permettra de gérer les comptes utilisateurs, 
              leurs rôles et permissions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
