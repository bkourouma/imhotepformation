import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Mail, Phone, Building2, Calendar, Users, UserPlus } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { ConfirmModal } from '../../components/shared/Modal';
import { useApi, useCrud } from '../../hooks/useApi';
import { entreprisesService, employesService } from '../../services/api';
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

  // Récupération des employés
  const { data: employes, loading: employesLoading, error: employesError } = useApi(
    () => employesService.getByEntreprise(id),
    [id]
  );

  const { remove, loading: deleteLoading } = useCrud(entreprisesService);

  // Gestion de la suppression
  const handleDelete = async () => {
    try {
      await remove(id);
      navigate('.');
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
        <Button as={Link} to="." className="mt-4">
          Retour aux entreprises
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
            to="."
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
            to={`${id}/edit`}
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

          {/* Liste des employés */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employés ({employes?.length || 0})
                </CardTitle>
                <Button
                  as={Link}
                  to={`/admin/employes/new?entreprise_id=${id}`}
                  variant="primary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Ajouter un employé
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {employesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="sm" />
                </div>
              ) : employesError ? (
                <ErrorMessage 
                  error={employesError} 
                  title="Erreur lors du chargement des employés"
                />
              ) : employes && employes.length > 0 ? (
                <div className="space-y-4">
                  {employes.map((employe) => (
                    <div key={employe.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {employe.prenom} {employe.nom}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {employe.fonction}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {employe.email}
                            </span>
                            {employe.telephone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {employe.telephone}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            Créé le {dateUtils.format(employe.created_at)}
                          </p>
                        </div>
                        <Button
                          as={Link}
                          to={`/admin/employes/${employe.id}/edit`}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Modifier
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    Aucun employé dans cette entreprise
                  </p>
                  <Button
                    as={Link}
                    to={`/admin/employes/new?entreprise_id=${id}`}
                    variant="primary"
                  >
                    Ajouter le premier employé
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
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Employés</span>
                  </div>
                  <span className="font-semibold">
                    {employes?.length || 0}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Date d'inscription</span>
                  </div>
                  <span className="font-semibold text-sm">
                    {dateUtils.format(entreprise.created_at)}
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
                  to={`/admin/employes/new?entreprise_id=${id}`}
                  variant="primary"
                  className="w-full justify-center flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Ajouter un Employé
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
