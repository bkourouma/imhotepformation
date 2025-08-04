import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, Users, Building2, BookOpen, Mail, Phone } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { ConfirmModal } from '../../components/shared/Modal';
import { useApi, useCrud } from '../../hooks/useApi';
import { inscriptionsService } from '../../services/api';
import { dateUtils } from '../../utils/helpers';
import { useState } from 'react';

export default function InscriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deleteModal, setDeleteModal] = useState(false);

  // Récupération des données
  const { data: inscription, loading, error } = useApi(
    () => inscriptionsService.getById(id),
    [id]
  );

  const { remove, loading: deleteLoading } = useCrud(inscriptionsService);

  // Gestion de la suppression
  const handleDelete = async () => {
    try {
      await remove(id);
      navigate('/inscriptions');
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
        title="Erreur lors du chargement de l'inscription"
      />
    );
  }

  if (!inscription) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Inscription non trouvée</p>
        <Button as={Link} to="/inscriptions" className="mt-4">
          Retour aux inscriptions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            as={Link}
            to="/inscriptions"
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Inscription #{inscription.id}
            </h1>
            <p className="text-gray-600 mt-1">
              Créée le {dateUtils.format(inscription.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            as={Link}
            to={`/inscriptions/${id}/edit`}
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
          {/* Entreprise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Entreprise
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {inscription.entreprise_nom}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">
                        <a
                          href={`mailto:${inscription.entreprise_email}`}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          {inscription.entreprise_email}
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-medium">
                        <a
                          href={`tel:${inscription.entreprise_telephone}`}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          {inscription.entreprise_telephone}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Formation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {inscription.formation_intitule}
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Public cible :</p>
                      <p className="text-gray-600">{inscription.formation_cible}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Objectifs pédagogiques :</p>
                      <p className="text-gray-600">{inscription.formation_objectifs}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Contenu :</p>
                      <p className="text-gray-600">{inscription.formation_contenu}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    as={Link}
                    to={`/formations/${inscription.formation_id}`}
                    variant="ghost"
                    size="sm"
                  >
                    Voir la fiche complète de la formation
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar avec détails */}
        <div className="space-y-6">
          {/* Détails de l'inscription */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de l'inscription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Participants</span>
                  </div>
                  <span className="font-semibold text-lg">
                    {inscription.nombre_participants}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Date souhaitée</span>
                  </div>
                  <span className="font-semibold">
                    {dateUtils.format(inscription.date_souhaitee)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Statut</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Confirmée
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
                  to={`/inscriptions/${id}/edit`}
                  variant="primary"
                  className="w-full justify-center"
                >
                  Modifier l'inscription
                </Button>
                <Button
                  as="a"
                  href={`mailto:${inscription.entreprise_email}?subject=Formation ${inscription.formation_intitule}&body=Bonjour,\n\nConcernant votre inscription à la formation "${inscription.formation_intitule}" prévue le ${dateUtils.format(inscription.date_souhaitee)}...`}
                  variant="secondary"
                  className="w-full justify-center"
                >
                  Envoyer un email
                </Button>
                <Button
                  as={Link}
                  to={`/formations/${inscription.formation_id}`}
                  variant="secondary"
                  className="w-full justify-center"
                >
                  Voir la formation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informations système */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID :</span>
                  <span className="font-mono">#{inscription.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Créée le :</span>
                  <span>{dateUtils.format(inscription.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dernière modification :</span>
                  <span>{dateUtils.formatRelative(inscription.created_at)}</span>
                </div>
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
        title="Supprimer l'inscription"
        message={`Êtes-vous sûr de vouloir supprimer cette inscription de "${inscription.entreprise_nom}" à la formation "${inscription.formation_intitule}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        loading={deleteLoading}
      />
    </div>
  );
}
