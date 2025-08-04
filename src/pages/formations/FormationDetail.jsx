import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Users, Calendar } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { ConfirmModal } from '../../components/shared/Modal';
import { useApi, useCrud } from '../../hooks/useApi';
import { formationsService, inscriptionsService } from '../../services/api';
import { dateUtils } from '../../utils/helpers';
import { useState } from 'react';

export default function FormationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState(false);

  // Récupération des données
  const { data: formation, loading, error } = useApi(
    () => formationsService.getById(id),
    [id]
  );

  const { data: inscriptions, loading: inscriptionsLoading } = useApi(
    () => inscriptionsService.getAll({ formation_id: id }),
    [id]
  );

  const { remove, loading: deleteLoading } = useCrud(formationsService);

  // Gestion de la suppression
  const handleDelete = async () => {
    try {
      await remove(id);
      navigate('/formations');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

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
        title="Erreur lors du chargement de la formation"
      />
    );
  }

  if (!formation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Formation non trouvée</p>
        <Button as={Link} to="/formations" className="mt-4">
          Retour aux formations
        </Button>
      </div>
    );
  }

  const totalParticipants = inscriptions?.reduce((sum, inscription) =>
    sum + inscription.nombre_participants, 0
  ) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            as={Link}
            to="/formations"
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {formation.intitule}
            </h1>
            <p className="text-gray-600 mt-1">
              Créé le {dateUtils.format(formation.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            as={Link}
            to={`/formations/${id}/edit`}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
          <Button
            variant="danger"
            onClick={() => setDeleteModal(true)}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Public cible */}
          <Card>
            <CardHeader>
              <CardTitle>Public cible</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{formation.cible}</p>
            </CardContent>
          </Card>

          {/* Objectifs pédagogiques */}
          <Card>
            <CardHeader>
              <CardTitle>Objectifs pédagogiques</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">
                {formation.objectifs_pedagogiques}
              </p>
            </CardContent>
          </Card>

          {/* Contenu */}
          <Card>
            <CardHeader>
              <CardTitle>Contenu de la formation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">
                {formation.contenu}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar avec statistiques */}
        <div className="space-y-6">
          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Inscriptions</span>
                  </div>
                  <span className="font-semibold">
                    {inscriptions?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Participants</span>
                  </div>
                  <span className="font-semibold">
                    {totalParticipants}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inscriptions récentes */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Inscriptions récentes</CardTitle>
                <Button
                  as={Link}
                  to={`/inscriptions?formation_id=${id}`}
                  variant="ghost"
                  size="sm"
                >
                  Voir tout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {inscriptionsLoading ? (
                <LoadingSpinner size="sm" />
              ) : inscriptions && inscriptions.length > 0 ? (
                <div className="space-y-3">
                  {inscriptions.slice(0, 5).map((inscription) => (
                    <div key={inscription.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                      <div className="font-medium text-sm">
                        {inscription.entreprise_nom}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {inscription.nombre_participants} participants • {dateUtils.format(inscription.date_souhaitee)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  Aucune inscription pour cette formation
                </p>
              )}
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  as={Link}
                  to={`/inscriptions/new?formation_id=${id}`}
                  variant="primary"
                  className="w-full justify-center"
                >
                  Nouvelle inscription
                </Button>
                <Button
                  as={Link}
                  to={`/formations/${id}/edit`}
                  variant="secondary"
                  className="w-full justify-center"
                >
                  Modifier la formation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        open={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer la formation"
        message={`Êtes-vous sûr de vouloir supprimer la formation "${formation.intitule}" ? Cette action supprimera également toutes les inscriptions associées et est irréversible.`}
        confirmText="Supprimer"
        loading={deleteLoading}
      />
    </div>
  );
}
