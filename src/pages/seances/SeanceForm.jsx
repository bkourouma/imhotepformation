import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Save, ArrowLeft, Calendar, Clock } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import FormField, { Input } from '../../components/shared/FormField';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { seancesService, formationsService } from '../../services/api';
import { dateUtils } from '../../utils/helpers';

const SeanceForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEditing = !!id;

  // Determine if we're in admin section or user section
  const isAdminSection = location.pathname.startsWith('/admin');
  const backPath = isAdminSection ? '/admin/seances' : '/seances';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formations, setFormations] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    defaultValues: {
      formation_id: '',
      intitule: '',
      lieu: '',
      date_debut: '',
      date_fin: '',
      duree: 8,
      capacite: 20
    }
  });

  useEffect(() => {
    loadFormations();
    if (isEditing) {
      loadSeance();
    }
  }, [id]);

  const loadFormations = async () => {
    try {
      console.log('Loading formations...');
      const response = await formationsService.getAll();
      console.log('Formations response:', response);
      setFormations(response || []);
      console.log('Formations state set to:', response || []);
    } catch (err) {
      console.error('Erreur lors du chargement des formations:', err);
    }
  };

  const loadSeance = async () => {
    try {
      setLoading(true);
      const seance = await seancesService.getById(id);
      if (seance) {
        setValue('formation_id', seance.formation_id);
        setValue('intitule', seance.description || seance.intitule); // Map description to intitule
        setValue('lieu', seance.lieu);
        setValue('date_debut', dateUtils.toDateTimeInputValue(seance.date_debut));
        setValue('date_fin', dateUtils.toDateTimeInputValue(seance.date_fin));
        setValue('duree', seance.duree || 8);
        setValue('capacite', seance.capacite_max || seance.capacite); // Map capacite_max to capacite
      }
    } catch (err) {
      setError('Erreur lors du chargement de la séance');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError(null);

      if (isEditing) {
        await seancesService.update(id, data);
      } else {
        await seancesService.create(data);
      }

      navigate(backPath);
    } catch (err) {
      setError('Erreur lors de la sauvegarde de la séance');
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
            {isEditing ? 'Modifier la séance' : 'Nouvelle séance'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Modifiez les détails de la séance' : 'Créez une nouvelle séance de formation'}
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
                <Clock className="h-5 w-5" />
                Modifier la séance
              </>
            ) : (
              <>
                <Calendar className="h-5 w-5" />
                Nouvelle séance
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Row 1: Formation and Intitulé */}
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

              {/* Intitulé */}
              <FormField
                label="Intitulé de la séance"
                error={errors.intitule?.message}
              >
                <Input
                  {...register('intitule', { 
                    required: 'L\'intitulé est obligatoire' 
                  })}
                  placeholder="Ex: Session 1 - Introduction à React"
                  error={!!errors.intitule}
                />
              </FormField>
            </div>

            {/* Row 2: Lieu and Durée */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lieu */}
              <FormField
                label="Lieu"
                error={errors.lieu?.message}
              >
                <Input
                  {...register('lieu', { 
                    required: 'Le lieu est obligatoire' 
                  })}
                  placeholder="Ex: Salle de formation A"
                  error={!!errors.lieu}
                />
              </FormField>

              {/* Durée */}
              <FormField
                label="Durée (en heures)"
                error={errors.duree?.message}
              >
                <Input
                  type="number"
                  {...register('duree', { 
                    required: 'La durée est obligatoire',
                    min: { value: 1, message: 'La durée doit être supérieure à 0' }
                  })}
                  placeholder="8"
                  error={!!errors.duree}
                />
              </FormField>
            </div>

            {/* Row 3: Date de début, Date de fin, and Capacité */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Date de début */}
              <FormField
                label="Date et heure de début"
                error={errors.date_debut?.message}
              >
                <Input
                  type="datetime-local"
                  {...register('date_debut', { 
                    required: 'La date de début est obligatoire' 
                  })}
                  error={!!errors.date_debut}
                />
              </FormField>

              {/* Date de fin */}
              <FormField
                label="Date et heure de fin"
                error={errors.date_fin?.message}
              >
                <Input
                  type="datetime-local"
                  {...register('date_fin', { 
                    required: 'La date de fin est obligatoire' 
                  })}
                  error={!!errors.date_fin}
                />
              </FormField>

              {/* Capacité */}
              <FormField
                label="Capacité"
                error={errors.capacite?.message}
              >
                <Input
                  type="number"
                  {...register('capacite', { 
                    required: 'La capacité est obligatoire',
                    min: { value: 1, message: 'La capacité doit être supérieure à 0' }
                  })}
                  placeholder="20"
                  error={!!errors.capacite}
                />
              </FormField>
            </div>

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

export default SeanceForm; 