import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import FormField, { Input } from '../../components/shared/FormField';
import { useApi, useCrud } from '../../hooks/useApi';
import { entreprisesService } from '../../services/api';
import { validation } from '../../utils/helpers';

export default function EntrepriseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Récupération des données pour l'édition
  const { data: entreprise, loading, error } = useApi(
    () => isEdit ? entreprisesService.getById(id) : Promise.resolve(null),
    [id, isEdit]
  );

  const { create, update, loading: saveLoading, error: saveError } = useCrud(entreprisesService);

  // Configuration du formulaire
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      raison_sociale: '',
      telephone: '',
      email: '',
    },
  });

  // Remplir le formulaire lors de l'édition
  useEffect(() => {
    if (entreprise) {
      setValue('raison_sociale', entreprise.raison_sociale);
      setValue('telephone', entreprise.telephone);
      setValue('email', entreprise.email);
    }
  }, [entreprise, setValue]);

  // Soumission du formulaire
  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await update(id, data);
      } else {
        await create(data);
      }
      navigate('/entreprises');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
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

  if (isEdit && !entreprise) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Entreprise non trouvée</p>
        <Button as={Link} to="/entreprises" className="mt-4">
          Retour aux entreprises
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          as={Link}
          to={isEdit ? `/entreprises/${id}` : '/entreprises'}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit
              ? 'Modifiez les informations de l\'entreprise'
              : 'Ajoutez une nouvelle entreprise'
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations de l'entreprise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Raison sociale */}
            <FormField
              label="Raison sociale"
              error={errors.raison_sociale?.message}
              required
            >
              <Input
                {...register('raison_sociale', {
                  required: 'La raison sociale est obligatoire',
                  minLength: {
                    value: 2,
                    message: 'La raison sociale doit contenir au moins 2 caractères'
                  }
                })}
                placeholder="Ex: TechCorp Solutions"
                error={errors.raison_sociale}
              />
            </FormField>

            {/* Email */}
            <FormField
              label="Adresse email"
              error={errors.email?.message}
              required
            >
              <Input
                type="email"
                {...register('email', {
                  required: 'L\'adresse email est obligatoire',
                  validate: {
                    isEmail: (value) => validation.email(value) || 'L\'adresse email n\'est pas valide'
                  }
                })}
                placeholder="Ex: contact@techcorp.fr"
                error={errors.email}
              />
            </FormField>

            {/* Téléphone */}
            <FormField
              label="Numéro de téléphone"
              error={errors.telephone?.message}
              required
            >
              <Input
                type="tel"
                {...register('telephone', {
                  required: 'Le numéro de téléphone est obligatoire',
                  validate: {
                    isPhone: (value) => validation.phone(value) || 'Le numéro de téléphone n\'est pas valide (format français attendu)'
                  }
                })}
                placeholder="Ex: 01 23 45 67 89"
                error={errors.telephone}
              />
              <p className="text-xs text-gray-500 mt-1">
                Format accepté : 01 23 45 67 89, +33 1 23 45 67 89, etc.
              </p>
            </FormField>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            as={Link}
            to={isEdit ? `/entreprises/${id}` : '/entreprises'}
            variant="secondary"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            loading={saveLoading}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isEdit ? 'Mettre à jour' : 'Créer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
