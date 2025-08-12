import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowLeft, Save, Users, BookOpen, Building2, Plus, Trash2, Check } from 'lucide-react';
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
    control,
  } = useForm({
    defaultValues: {
      entreprise_id: selectedCompany?.id || '',
      selected_formations: formations ? formations.map(f => f.id) : [],
      participants: [
        {
          nom: '',
          prenom: '',
          email: '',
          telephone: '',
          fonction: ''
        }
      ]
    },
  });

  // Configuration du tableau des participants
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'participants'
  });

  // Remplir le formulaire lors de l'édition
  useEffect(() => {
    if (inscription) {
      setValue('entreprise_id', inscription.entreprise_id);
      setValue('selected_formations', [inscription.formation_id]);
      
      // Remplir les participants si disponibles
      if (inscription.participants && inscription.participants.length > 0) {
        setValue('participants', inscription.participants);
      }
    }
  }, [inscription, setValue]);

  // Pré-sélectionner l'entreprise et les formations
  useEffect(() => {
    if (selectedCompany) {
      setValue('entreprise_id', selectedCompany.id);
    }
    if (formations && !isEdit) {
      // Sélectionner toutes les formations par défaut, ou la formation présélectionnée
      if (preselectedFormationId) {
        setValue('selected_formations', [parseInt(preselectedFormationId)]);
      } else {
        setValue('selected_formations', formations.map(f => f.id));
      }
    }
  }, [selectedCompany, formations, preselectedFormationId, isEdit, setValue]);

  // Ajouter un participant
  const addParticipant = () => {
    append({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      fonction: ''
    });
  };

  // Supprimer un participant
  const removeParticipant = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Gérer la sélection/désélection des formations
  const handleFormationToggle = (formationId) => {
    const currentSelected = watch('selected_formations') || [];
    const isSelected = currentSelected.includes(formationId);
    
    if (isSelected) {
      setValue('selected_formations', currentSelected.filter(id => id !== formationId));
    } else {
      setValue('selected_formations', [...currentSelected, formationId]);
    }
  };

  // Sélectionner/désélectionner toutes les formations
  const toggleAllFormations = () => {
    const currentSelected = watch('selected_formations') || [];
    if (currentSelected.length === formations?.length) {
      setValue('selected_formations', []);
    } else {
      setValue('selected_formations', formations?.map(f => f.id) || []);
    }
  };

  // Soumission du formulaire
  const onSubmit = async (data) => {
    try {
      // Vérifier que l'entreprise est sélectionnée
      if (!selectedCompany || !data.entreprise_id) {
        throw new Error('Aucune entreprise sélectionnée');
      }

      // Vérifier qu'il y a au moins une formation sélectionnée
      if (!data.selected_formations || data.selected_formations.length === 0) {
        throw new Error('Veuillez sélectionner au moins une formation');
      }

      // Vérifier qu'il y a au moins un participant
      if (!data.participants || data.participants.length === 0) {
        throw new Error('Au moins un participant est requis');
      }

      // Créer une inscription pour chaque formation sélectionnée
      const inscriptions = [];
      for (const formationId of data.selected_formations) {
        const formData = {
          entreprise_id: parseInt(data.entreprise_id),
          formation_id: parseInt(formationId),
          participants: data.participants
        };

        if (isEdit) {
          await update(id, formData);
        } else {
          const result = await create(formData);
          inscriptions.push(result);
        }
      }

      if (!isEdit) {
        // Rediriger vers la liste des inscriptions après création
        navigate('.');
      } else {
        navigate('.');
      }
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
        <Button as={Link} to="." className="mt-4">
          Retour aux inscriptions
        </Button>
      </div>
    );
  }

  const selectedFormations = watch('selected_formations') || [];
  const participants = watch('participants') || [];
  const allFormationsSelected = selectedFormations.length === (formations?.length || 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          as={Link}
          to={isEdit ? `${id}` : '.'}
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
              : 'Inscrivez votre entreprise aux formations'
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
                        to="/"
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
                    <Button as={Link} to="/">
                      Sélectionner une entreprise
                    </Button>
                  </div>
                )}
                <input type="hidden" {...register('entreprise_id')} />
              </CardContent>
            </Card>

            {/* Formations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Formations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Bouton pour sélectionner/désélectionner toutes les formations */}
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      {selectedFormations.length} formation(s) sélectionnée(s)
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={toggleAllFormations}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      {allFormationsSelected ? 'Désélectionner tout' : 'Sélectionner tout'}
                    </Button>
                  </div>

                  {/* Liste des formations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formations?.map((formation) => {
                      const isSelected = selectedFormations.includes(formation.id);
                      return (
                        <div
                          key={formation.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-200 bg-white hover:bg-gray-50'
                          }`}
                          onClick={() => handleFormationToggle(formation.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                              isSelected
                                ? 'border-orange-500 bg-orange-500'
                                : 'border-gray-300'
                            }`}>
                              {isSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {formation.intitule}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {formation.cible}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {errors.selected_formations && (
                    <p className="text-red-600 text-sm mt-2">
                      {errors.selected_formations.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        Participant {index + 1}
                      </h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParticipant(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Prénom"
                        error={errors.participants?.[index]?.prenom?.message}
                        required
                      >
                        <Input
                          {...register(`participants.${index}.prenom`, {
                            required: 'Le prénom est obligatoire'
                          })}
                          placeholder="Prénom"
                          error={errors.participants?.[index]?.prenom}
                        />
                      </FormField>

                      <FormField
                        label="Nom"
                        error={errors.participants?.[index]?.nom?.message}
                        required
                      >
                        <Input
                          {...register(`participants.${index}.nom`, {
                            required: 'Le nom est obligatoire'
                          })}
                          placeholder="Nom"
                          error={errors.participants?.[index]?.nom}
                        />
                      </FormField>

                      <FormField
                        label="Email"
                        error={errors.participants?.[index]?.email?.message}
                        required
                      >
                        <Input
                          type="email"
                          {...register(`participants.${index}.email`, {
                            required: 'L\'email est obligatoire',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Email invalide'
                            }
                          })}
                          placeholder="email@exemple.com"
                          error={errors.participants?.[index]?.email}
                        />
                      </FormField>

                      <FormField
                        label="Téléphone"
                        error={errors.participants?.[index]?.telephone?.message}
                        required
                      >
                        <Input
                          {...register(`participants.${index}.telephone`, {
                            required: 'Le téléphone est obligatoire'
                          })}
                          placeholder="01 23 45 67 89"
                          error={errors.participants?.[index]?.telephone}
                        />
                      </FormField>

                      <FormField
                        label="Fonction"
                        error={errors.participants?.[index]?.fonction?.message}
                        required
                        className="md:col-span-2"
                      >
                        <Input
                          {...register(`participants.${index}.fonction`, {
                            required: 'La fonction est obligatoire'
                          })}
                          placeholder="Développeur, Chef de projet, etc."
                          error={errors.participants?.[index]?.fonction}
                        />
                      </FormField>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addParticipant}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un participant
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar avec aperçu */}
          <div className="space-y-6">
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
                    <span className="text-gray-600">Formations :</span>
                    <span className="font-medium">
                      {selectedFormations.length} sélectionnée(s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Participants :</span>
                    <span className="font-medium">
                      {participants.length}
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
            disabled={!selectedCompany || !watch('entreprise_id') || participants.length === 0 || selectedFormations.length === 0}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isEdit ? 'Mettre à jour' : 'Créer les inscriptions'}
          </Button>
        </div>
      </form>
    </div>
  );
}
