import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rapports et statistiques</h1>
        <p className="text-gray-600 mt-1">
          Analysez les données de la plateforme
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Rapports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              Fonctionnalité en cours de développement
            </p>
            <p className="text-sm text-gray-400">
              Cette section permettra de générer des rapports détaillés 
              sur les inscriptions, formations et entreprises.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
