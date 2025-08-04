import { useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Calendar, Users, BookOpen, Building2 } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import FormField, { Input, Select } from '../../components/shared/FormField';
import { useApi, useCrud } from '../../hooks/useApi';
import { useCompanySession } from '../../hooks/useCompanySession.jsx';
import { inscriptionsService, formationsService } from '../../services/api';
import { dateUtils } from '../../utils/helpers';

export default function InscriptionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedCompany } = useCompanySession();
  const isEdit = Boolean(id);

  // Récupération des paramètres URL pour pré-sélection
  const preselectedFormationId = searchParams.get('formation_id');

  // Récupération des données
  const { data: inscription, loading, error } = useApi(
    () => isEdit ? inscriptionsService.getById(id) : Promise.resolve(null),
    [id, isEdit]
  );

  const { data: formations, loading: formationsLoading } = useApi(
    formationsService.getAll,
    []
  );

  const { create, update, loading: saveLoading, error: saveError } = useCrud(inscriptionsService);

  // Configuration du formulaire
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      entreprise_id: selectedCompany?.id || '',
      formation_id: preselectedFormationId || '',
      nombre_participants: 1,
      date_souhaitee: '',
    },
  });

  // Remplir le formulaire lors de l'édition
  useEffect(() => {
    if (inscription) {
      setValue('entreprise_id', inscription.entreprise_id);
      setValue('formation_id', inscription.formation_id);
      setValue('nombre_participants', inscription.nombre_participants);
      setValue('date_souhaitee', dateUtils.toInputValue(inscription.date_souhaitee));
    }
  }, [inscription, setValue]);

  // Pré-sélectionner l'entreprise et la formation si spécifiées
  useEffect(() => {
    if (selectedCompany) {
      setValue('entreprise_id', selectedCompany.id);
    }
    if (preselectedFormationId && !isEdit) {
      setValue('formation_id', preselectedFormationId);
    }
  }, [selectedCompany, preselectedFormationId, isEdit, setValue]);

  // Soumission du formulaire
  const onSubmit = async (data) => {
    try {
      // Vérifier que l'entreprise est sélectionnée
      if (!selectedCompany || !data.entreprise_id) {
        throw new Error('Aucune entreprise sélectionnée');
      }

      // Convertir les données
      const formData = {
        ...data,
        entreprise_id: parseInt(data.entreprise_id),
        formation_id: parseInt(data.formation_id),
        nombre_participants: parseInt(data.nombre_participants),
      };

      if (isEdit) {
        await update(id, formData);
      } else {
        await create(formData);
      }
      navigate('/inscriptions');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  if (loading || formationsLoading) {
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

  if (isEdit && !inscription) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Inscription non trouvée</p>
        <Button as={Link} to="/inscriptions" className="mt-4">
          Retour aux inscriptions
        </Button>
      </div>
    );
  }

  const selectedFormationId = watch('formation_id');
  const selectedFormation = formations?.find(f => f.id == selectedFormationId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          as={Link}
          to={isEdit ? `/inscriptions/${id}` : '/inscriptions'}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Modifier l\'inscription' : 'Nouvelle inscription'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit
              ? 'Modifiez les détails de l\'inscription'
              : 'Inscrivez votre entreprise à une formation'
            }
          </p>
        </div>
      </div>

      {/* Messages d'erreur */}
      {saveError && (
        <ErrorMessage
          error={saveError}
          title="Erreur lors de la sauvegarde"
        />
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire principal */}
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
                {selectedCompany ? (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {selectedCompany.raison_sociale}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedCompany.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedCompany.telephone}
                        </p>
                      </div>
                      <Button
                        as={Link}
                        to="/company-selection"
                        variant="ghost"
                        size="sm"
                      >
                        Changer
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 mb-4">Aucune entreprise sélectionnée</p>
                    <Button as={Link} to="/company-selection">
                      Sélectionner une entreprise
                    </Button>
                  </div>
                )}
                <input type="hidden" {...register('entreprise_id')} />
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
                <FormField
                  label="Sélectionner une formation"
                  error={errors.formation_id?.message}
                  required
                >
                  <Select
                    {...register('formation_id', {
                      required: 'Veuillez sélectionner une formation'
                    })}
                    placeholder="Choisissez une formation..."
                    options={formations?.map(formation => ({
                      value: formation.id,
                      label: formation.intitule
                    })) || []}
                    error={errors.formation_id}
                  />
                </FormField>
              </CardContent>
            </Card>

            {/* Détails de l'inscription */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Détails de l'inscription
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  label="Nombre de participants"
                  error={errors.nombre_participants?.message}
                  required
                >
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    {...register('nombre_participants', {
                      required: 'Le nombre de participants est obligatoire',
                      min: {
                        value: 1,
                        message: 'Au moins 1 participant requis'
                      },
                      max: {
                        value: 100,
                        message: 'Maximum 100 participants'
                      }
                    })}
                    error={errors.nombre_participants}
                  />
                </FormField>

                <FormField
                  label="Date souhaitée"
                  error={errors.date_souhaitee?.message}
                  required
                >
                  <Input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    {...register('date_souhaitee', {
                      required: 'La date souhaitée est obligatoire'
                    })}
                    error={errors.date_souhaitee}
                  />
                </FormField>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar avec aperçu */}
          <div className="space-y-6">
            {/* Aperçu de la formation sélectionnée */}
            {selectedFormation && (
              <Card>
                <CardHeader>
                  <CardTitle>Formation sélectionnée</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {selectedFormation.intitule}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedFormation.cible}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Objectifs :</p>
                      <p className="text-sm text-gray-600">
                        {selectedFormation.objectifs_pedagogiques.substring(0, 150)}...
                      </p>
                    </div>
                    <Button
                      as={Link}
                      to={`/formations/${selectedFormation.id}`}
                      variant="ghost"
                      size="sm"
                      className="w-full"
                    >
                      Voir les détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Résumé */}
            <Card>
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Entreprise :</span>
                    <span className="font-medium">
                      {selectedCompany?.raison_sociale || 'Non sélectionnée'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Formation :</span>
                    <span className="font-medium">
                      {selectedFormation?.intitule || 'Non sélectionnée'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Participants :</span>
                    <span className="font-medium">
                      {watch('nombre_participants') || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date :</span>
                    <span className="font-medium">
                      {watch('date_souhaitee') ?
                        dateUtils.format(watch('date_souhaitee')) :
                        'Non définie'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            as={Link}
            to={isEdit ? `/inscriptions/${id}` : '/inscriptions'}
            variant="secondary"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            loading={saveLoading}
            disabled={!selectedCompany || !watch('entreprise_id')}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isEdit ? 'Mettre à jour' : 'Créer l\'inscription'}
          </Button>
        </div>
      </form>
    </div>
  );
}
