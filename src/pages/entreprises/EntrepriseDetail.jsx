import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Building2, Calendar, Users } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { ConfirmModal } from '../../components/shared/Modal';
import { useApi, useCrud } from '../../hooks/useApi';
import { entreprisesService } from '../../services/api';
import { dateUtils, formatUtils } from '../../utils/helpers';
import { useState } from 'react';

export default function EntrepriseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState(false);

  // Récupération des données
  const { data: entreprise, loading, error } = useApi(
    () => entreprisesService.getProfile(id),
    [id]
  );

  const { remove, loading: deleteLoading } = useCrud(entreprisesService);

  // Gestion de la suppression
  const handleDelete = async () => {
    try {
      await remove(id);
      navigate('/entreprises');
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
        title="Erreur lors du chargement de l'entreprise"
      />
    );
  }

  if (!entreprise) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Entreprise non trouvée</p>
        <Button as={Link} to="/entreprises" className="mt-4">
          Retour aux entreprises
        </Button>
      </div>
    );
  }

  const inscriptions = entreprise.inscriptions || [];
  const totalParticipants = inscriptions.reduce((sum, inscription) =>
    sum + inscription.nombre_participants, 0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            as={Link}
            to="/entreprises"
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {entreprise.raison_sociale}
            </h1>
            <p className="text-gray-600 mt-1">
              Inscrite le {dateUtils.format(entreprise.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            as={Link}
            to={`/entreprises/${id}/edit`}
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
          {/* Informations de contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations de contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">
                      <a
                        href={`mailto:${entreprise.email}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {entreprise.email}
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Téléphone</p>
                    <p className="font-medium">
                      <a
                        href={`tel:${entreprise.telephone}`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        {entreprise.telephone}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historique des inscriptions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Historique des inscriptions</CardTitle>
                <Button
                  as={Link}
                  to={`/inscriptions/new?entreprise_id=${id}`}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Nouvelle inscription
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {inscriptions.length > 0 ? (
                <div className="space-y-4">
                  {inscriptions.map((inscription) => (
                    <div key={inscription.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {inscription.formation_intitule}
                          </h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {inscription.nombre_participants} participants
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {dateUtils.format(inscription.date_souhaitee)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Inscrite le {dateUtils.format(inscription.created_at)}
                          </p>
                        </div>
                        <Button
                          as={Link}
                          to={`/inscriptions/${inscription.id}`}
                          variant="ghost"
                          size="sm"
                        >
                          Voir détail
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    Aucune inscription pour cette entreprise
                  </p>
                  <Button
                    as={Link}
                    to={`/inscriptions/new?entreprise_id=${id}`}
                    variant="primary"
                  >
                    Créer la première inscription
                  </Button>
                </div>
              )}
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
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Inscriptions</span>
                  </div>
                  <span className="font-semibold">
                    {inscriptions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Participants</span>
                  </div>
                  <span className="font-semibold">
                    {totalParticipants}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Membre depuis</span>
                  </div>
                  <span className="font-semibold text-sm">
                    {dateUtils.formatRelative(entreprise.created_at)}
                  </span>
                </div>
              </div>
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
                  to={`/inscriptions/new?entreprise_id=${id}`}
                  variant="primary"
                  className="w-full justify-center"
                >
                  Nouvelle inscription
                </Button>
                <Button
                  as={Link}
                  to={`/entreprises/${id}/edit`}
                  variant="secondary"
                  className="w-full justify-center"
                >
                  Modifier l'entreprise
                </Button>
                <Button
                  as="a"
                  href={`mailto:${entreprise.email}`}
                  variant="secondary"
                  className="w-full justify-center"
                >
                  Envoyer un email
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
        title="Supprimer l'entreprise"
        message={`Êtes-vous sûr de vouloir supprimer l'entreprise "${entreprise.raison_sociale}" ? Cette action supprimera également toutes les inscriptions associées et est irréversible.`}
        confirmText="Supprimer"
        loading={deleteLoading}
      />
    </div>
  );
}
