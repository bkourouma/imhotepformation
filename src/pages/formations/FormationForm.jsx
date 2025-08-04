import { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import FormField, { Input, Textarea } from '../../components/shared/FormField';
import { useApi, useCrud } from '../../hooks/useApi';
import { formationsService } from '../../services/api';

export default function FormationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Récupération des données pour l'édition
  const { data: formation, loading, error } = useApi(
    () => isEdit ? formationsService.getById(id) : Promise.resolve(null),
    [id, isEdit]
  );

  const { create, update, loading: saveLoading, error: saveError } = useCrud(formationsService);

  // Configuration du formulaire
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      intitule: '',
      cible: '',
      objectifs_pedagogiques: '',
      contenu: '',
    },
  });

  // Remplir le formulaire lors de l'édition
  useEffect(() => {
    if (formation) {
      setValue('intitule', formation.intitule);
      setValue('cible', formation.cible);
      setValue('objectifs_pedagogiques', formation.objectifs_pedagogiques);
      setValue('contenu', formation.contenu);
    }
  }, [formation, setValue]);

  // Soumission du formulaire
  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await update(id, data);
      } else {
        await create(data);
      }
      navigate('/formations');
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
        title="Erreur lors du chargement de la formation"
      />
    );
  }

  if (isEdit && !formation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Formation non trouvée</p>
        <Button as={Link} to="/formations" className="mt-4">
          Retour aux formations
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
          to={isEdit ? `/formations/${id}` : '/formations'}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Modifier la formation' : 'Nouvelle formation'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit
              ? 'Modifiez les informations de la formation'
              : 'Créez une nouvelle formation'
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
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Intitulé */}
            <FormField
              label="Intitulé de la formation"
              error={errors.intitule?.message}
              required
            >
              <Input
                {...register('intitule', {
                  required: 'L\'intitulé est obligatoire',
                  minLength: {
                    value: 3,
                    message: 'L\'intitulé doit contenir au moins 3 caractères'
                  }
                })}
                placeholder="Ex: Formation React Avancé"
                error={errors.intitule}
              />
            </FormField>

            {/* Public cible */}
            <FormField
              label="Public cible"
              error={errors.cible?.message}
              required
            >
              <Textarea
                {...register('cible', {
                  required: 'Le public cible est obligatoire',
                  minLength: {
                    value: 10,
                    message: 'Le public cible doit contenir au moins 10 caractères'
                  }
                })}
                placeholder="Ex: Développeurs JavaScript avec expérience React de base"
                rows={3}
                error={errors.cible}
              />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contenu pédagogique</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Objectifs pédagogiques */}
            <FormField
              label="Objectifs pédagogiques"
              error={errors.objectifs_pedagogiques?.message}
              required
            >
              <Textarea
                {...register('objectifs_pedagogiques', {
                  required: 'Les objectifs pédagogiques sont obligatoires',
                  minLength: {
                    value: 20,
                    message: 'Les objectifs pédagogiques doivent contenir au moins 20 caractères'
                  }
                })}
                placeholder="Ex: Maîtriser les concepts avancés de React : hooks personnalisés, optimisation des performances..."
                rows={4}
                error={errors.objectifs_pedagogiques}
              />
            </FormField>

            {/* Contenu */}
            <FormField
              label="Contenu détaillé"
              error={errors.contenu?.message}
              required
            >
              <Textarea
                {...register('contenu', {
                  required: 'Le contenu est obligatoire',
                  minLength: {
                    value: 50,
                    message: 'Le contenu doit contenir au moins 50 caractères'
                  }
                })}
                placeholder="Ex: Hooks avancés, Context API, Performance optimization, Testing, State management avec Redux Toolkit..."
                rows={6}
                error={errors.contenu}
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            as={Link}
            to={isEdit ? `/formations/${id}` : '/formations'}
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
