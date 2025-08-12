import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Save, ArrowLeft, Users2 } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import FormField, { Input, Textarea } from '../../components/shared/FormField';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { groupesService, seancesService, enseignantsService, formationsService } from '../../services/api';
import { dateUtils } from '../../utils/helpers';

const GroupeForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditing = !!id;

  // Determine if we're in admin section, enterprise portal, or user section
  const isAdminSection = location.pathname.startsWith('/admin');
  const isEntreprisePortal = location.pathname.startsWith('/entreprise');
  const backPath = isAdminSection ? '/admin/groupes' : isEntreprisePortal ? '/entreprise/formations' : '/groupes';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formations, setFormations] = useState([]);
  const [seances, setSeances] = useState([]);
  const [enseignants, setEnseignants] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    defaultValues: {
      formation_id: '',
      seance_id: '',
      libelle: '',
      capacite_max: 20,
      description: '',
      date_debut: '2025-01-01T08:00',
      date_fin: '2025-01-01T17:00',
      enseignant_id: ''
    }
  });

  // Watch the formation_id field to filter sessions
  const watchedFormationId = watch('formation_id');

  useEffect(() => {
    const initializeForm = async () => {
      await loadFormations();
      await loadEnseignants();

      if (isEditing) {
        await loadGroupe();
      } else {
        // Pre-select seance from URL parameter
        const urlParams = new URLSearchParams(location.search);
        const seanceId = urlParams.get('seance_id');
        if (seanceId) {
          // Load all seances to find the formation_id for this seance
          const allSeances = await seancesService.getAll();
          const seance = allSeances.find(s => s.id == seanceId);
          if (seance && seance.formation_id) {
            setValue('formation_id', seance.formation_id);
            // Load seances for this formation
            await loadSeancesByFormation(seance.formation_id);
            // Then set the seance
            setValue('seance_id', seanceId);
          }
        }
      }
    };

    initializeForm();
  }, [id, location.search]);

  // Load sessions when formation changes
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (watchedFormationId) {
      loadSeancesByFormation(watchedFormationId);
      // Clear seance selection when formation changes (but not on initial load)
      if (!isInitialLoad) {
        setValue('seance_id', '');
      }
    } else {
      setSeances([]);
      if (!isInitialLoad) {
        setValue('seance_id', '');
      }
    }
    setIsInitialLoad(false);
  }, [watchedFormationId, setValue]);

  const loadFormations = async () => {
    try {
      const response = await formationsService.getAll();
      setFormations(response || []);
    } catch (err) {
      console.error('Erreur lors du chargement des formations:', err);
    }
  };

  const loadSeancesByFormation = async (formationId) => {
    try {
      const response = await seancesService.getAll({ formation_id: formationId });
      setSeances(response || []);
    } catch (err) {
      console.error('Erreur lors du chargement des séances:', err);
    }
  };

  const loadEnseignants = async () => {
    try {
      const response = await enseignantsService.getActive();
      setEnseignants(response || []);
    } catch (err) {
      console.error('Erreur lors du chargement des enseignants:', err);
    }
  };

  const loadGroupe = async () => {
    try {
      setLoading(true);
      const groupe = await groupesService.getById(id);
      if (groupe) {
        // Get the formation_id from the seance data
        if (groupe.seance_id) {
          // Load the seance to get formation_id
          const allSeances = await seancesService.getAll();
          const seance = allSeances.find(s => s.id == groupe.seance_id);
          if (seance && seance.formation_id) {
            setValue('formation_id', seance.formation_id);
            // Load seances for this formation
            await loadSeancesByFormation(seance.formation_id);
          }
        }
        setValue('seance_id', groupe.seance_id);
        setValue('libelle', groupe.libelle);
        setValue('capacite_max', groupe.capacite_max);
        setValue('description', groupe.description || '');
        setValue('date_debut', dateUtils.toDateTimeInputValue(groupe.date_debut));
        setValue('date_fin', dateUtils.toDateTimeInputValue(groupe.date_fin));
        setValue('enseignant_id', groupe.enseignant_id || '');
      }
    } catch (err) {
      setError('Erreur lors du chargement du groupe');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare data for API
      const formattedData = {
        ...data,
        nom: data.libelle, // Map libelle to nom for API compatibility
        capacite: data.capacite_max,
        date_debut: data.date_debut || null,
        date_fin: data.date_fin || null,
        enseignant_id: data.enseignant_id || null
        // formation_id is not needed as it's derived from seance_id
      };

      if (isEditing) {
        await groupesService.update(id, formattedData);
      } else {
        await groupesService.create(formattedData);
      }

      navigate(backPath);
    } catch (err) {
      setError('Erreur lors de la sauvegarde du groupe');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate(backPath)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Modifier le groupe' : 'Nouveau groupe'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Modifiez les détails du groupe' : 'Créez un nouveau groupe de formation'}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <ErrorMessage 
          error={error} 
          onDismiss={() => setError(null)}
          title="Erreur"
        />
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Users2 className="h-5 w-5" />
                Modifier le groupe
              </>
            ) : (
              <>
                <Users2 className="h-5 w-5" />
                Nouveau groupe
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Row 1: Formation and Séance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Formation */}
              <FormField
                label="Formation"
                error={errors.formation_id?.message}
              >
                <select
                  {...register('formation_id', {
                    required: 'La formation est obligatoire'
                  })}
                  className={`form-input ${errors.formation_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                >
                  <option value="">Sélectionner une formation</option>
                  {formations.map((formation) => (
                    <option key={formation.id} value={formation.id}>
                      {formation.intitule}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* Séance */}
              <FormField
                label="Séance"
                error={errors.seance_id?.message}
              >
                <select
                  {...register('seance_id', {
                    required: 'La séance est obligatoire'
                  })}
                  className={`form-input ${errors.seance_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={!watchedFormationId}
                >
                  <option value="">
                    {watchedFormationId ? 'Sélectionner une séance' : 'Sélectionnez d\'abord une formation'}
                  </option>
                  {seances.map((seance) => (
                    <option key={seance.id} value={seance.id}>
                      {seance.description || seance.intitule} - {seance.lieu} ({dateUtils.format(seance.date_debut)})
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* Row 2: Nom du groupe and Capacité */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nom */}
              <FormField
                label="Nom du groupe"
                error={errors.libelle?.message}
              >
                <Input
                  {...register('libelle', {
                    required: 'Le nom est obligatoire'
                  })}
                  placeholder="Ex: Groupe A - Matin"
                  error={!!errors.libelle}
                />
              </FormField>

              {/* Capacité */}
              <FormField
                label="Capacité"
                error={errors.capacite_max?.message}
              >
                <Input
                  type="number"
                  {...register('capacite_max', {
                    required: 'La capacité est obligatoire',
                    min: { value: 1, message: 'La capacité doit être supérieure à 0' }
                  })}
                  placeholder="20"
                  error={!!errors.capacite_max}
                />
              </FormField>
            </div>

            {/* Row 3: Date de début, Date de fin, and Enseignant */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Date de début */}
              <FormField
                label="Date de début"
                error={errors.date_debut?.message}
              >
                <Input
                  type="datetime-local"
                  {...register('date_debut')}
                  error={!!errors.date_debut}
                  placeholder="01/01/2025 08:00"
                />
              </FormField>

              {/* Date de fin */}
              <FormField
                label="Date de fin"
                error={errors.date_fin?.message}
              >
                <Input
                  type="datetime-local"
                  {...register('date_fin')}
                  error={!!errors.date_fin}
                  placeholder="01/01/2025 17:00"
                />
              </FormField>

              {/* Enseignant */}
              <FormField
                label="Enseignant"
                error={errors.enseignant_id?.message}
              >
                <select
                  {...register('enseignant_id')}
                  className={`form-input ${errors.enseignant_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                >
                  <option value="">Aucun enseignant assigné</option>
                  {enseignants.map((enseignant) => (
                    <option key={enseignant.id} value={enseignant.id}>
                      {`${enseignant.prenom} ${enseignant.nom}`}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* Row 4: Description (full width) */}
            <FormField
              label="Description"
              error={errors.description?.message}
            >
              <Textarea
                {...register('description')}
                placeholder="Description optionnelle du groupe..."
                rows={3}
                error={!!errors.description}
              />
            </FormField>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(backPath)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2"

              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isEditing ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupeForm; 