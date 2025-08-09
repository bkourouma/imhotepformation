import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Save, ArrowLeft, UserPlus, UserCheck } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import FormField, { Input } from '../../components/shared/FormField';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { useCompanySession } from '../../hooks/useCompanySession.jsx';
import { employesService, entreprisesService } from '../../services/api';

export default function EmployeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedCompany } = useCompanySession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [entreprises, setEntreprises] = useState([]);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const isEditing = Boolean(id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm({
    defaultValues: {
      nom: '',
      prenom: '',
      email: '',
      fonction: '',
      telephone: '',
      password: '',
      entreprise_id: selectedCompany?.id || ''
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Charger les entreprises pour le select
        const entreprisesData = await entreprisesService.getAll();
        setEntreprises(entreprisesData);

        // Si on est en mode édition, charger les données de l'employé
        if (isEditing) {
          const employeData = await employesService.getById(id);
          if (employeData) {
            reset(employeData);
          } else {
            setError('Employé non trouvé');
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing, reset]);

  // Generate password from initials
  const generatePassword = (prenom, nom) => {
    if (!prenom || !nom) return '';
    const initials = (prenom.charAt(0) + nom.charAt(0)).toLowerCase();
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return initials + randomNumber;
  };

  // Auto-generate password when prenom or nom changes (for new employees)
  const handleNameChange = (field, value, onChange) => {
    onChange(value);
    if (!isEditing) {
      const currentValues = {
        prenom: field === 'prenom' ? value : document.querySelector('input[name="prenom"]')?.value || '',
        nom: field === 'nom' ? value : document.querySelector('input[name="nom"]')?.value || ''
      };
      if (currentValues.prenom && currentValues.nom) {
        const newPassword = generatePassword(currentValues.prenom, currentValues.nom);
        setGeneratedPassword(newPassword);
        setValue('password', newPassword);
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      setError('');
      setLoading(true);

      if (isEditing) {
        await employesService.update(id, data);
      } else {
        await employesService.create(data);
      }

      navigate('/employes');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Modifier l\'employé' : 'Nouvel employé'}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Modifiez les informations de l\'employé' : 'Ajoutez un nouvel employé à votre entreprise'}
          </p>
        </div>
        <Button
          as="button"
          onClick={() => navigate('/employes')}
          variant="secondary"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>

      {/* Formulaire */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <UserCheck className="h-5 w-5" />
                Modifier l'employé
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Nouvel employé
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <ErrorMessage 
              error={error} 
              onDismiss={() => setError('')}
              title="Erreur lors de la sauvegarde"
            />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Row 1: Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Prénom"
                error={errors.prenom?.message}
                required
              >
                <Input
                  {...register('prenom', {
                    required: 'Le prénom est obligatoire',
                    onChange: (e) => handleNameChange('prenom', e.target.value, () => {})
                  })}
                  placeholder="Prénom"
                  error={errors.prenom}
                  onChange={(e) => handleNameChange('prenom', e.target.value, (value) => setValue('prenom', value))}
                />
              </FormField>

              <FormField
                label="Nom"
                error={errors.nom?.message}
                required
              >
                <Input
                  {...register('nom', {
                    required: 'Le nom est obligatoire',
                    onChange: (e) => handleNameChange('nom', e.target.value, () => {})
                  })}
                  placeholder="Nom"
                  error={errors.nom}
                  onChange={(e) => handleNameChange('nom', e.target.value, (value) => setValue('nom', value))}
                />
              </FormField>
            </div>

            {/* Row 2: Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Email"
                error={errors.email?.message}
                required
              >
                <Input
                  type="email"
                  {...register('email', {
                    required: 'L\'email est obligatoire',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide'
                    }
                  })}
                  placeholder="email@exemple.com"
                  error={errors.email}
                />
              </FormField>

              <FormField
                label="Téléphone"
                error={errors.telephone?.message}
                required
              >
                <Input
                  type="tel"
                  {...register('telephone', {
                    required: 'Le téléphone est obligatoire'
                  })}
                  placeholder="01 23 45 67 89"
                  error={errors.telephone}
                />
              </FormField>
            </div>

            {/* Row 3: Professional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Fonction"
                error={errors.fonction?.message}
                required
              >
                <Input
                  {...register('fonction', {
                    required: 'La fonction est obligatoire'
                  })}
                  placeholder="Développeur, Chef de projet, etc."
                  error={errors.fonction}
                />
              </FormField>

              <FormField
                label="Entreprise"
                error={errors.entreprise_id?.message}
                required
              >
                <select
                  {...register('entreprise_id', {
                    required: 'L\'entreprise est obligatoire'
                  })}
                  className={`form-input ${errors.entreprise_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                >
                  <option value="">Sélectionner une entreprise</option>
                  {entreprises.map((entreprise) => (
                    <option key={entreprise.id} value={entreprise.id}>
                      {entreprise.raison_sociale}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            {/* Row 4: Security Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Mot de passe"
                error={errors.password?.message}
                required={!isEditing}
              >
                <div className="space-y-2">
                  <Input
                    type="text"
                    {...register('password', {
                      required: !isEditing ? 'Le mot de passe est obligatoire' : false,
                      minLength: {
                        value: 4,
                        message: 'Le mot de passe doit contenir au moins 4 caractères'
                      }
                    })}
                    placeholder={isEditing ? "Laisser vide pour ne pas modifier" : "Mot de passe généré automatiquement"}
                    error={errors.password}
                    readOnly={!isEditing && generatedPassword}
                  />
                  {!isEditing && generatedPassword && (
                    <p className="text-sm text-green-600">
                      ✓ Mot de passe généré automatiquement: <strong>{generatedPassword}</strong>
                    </p>
                  )}
                  {isEditing && (
                    <p className="text-sm text-gray-500">
                      Laisser vide pour conserver le mot de passe actuel
                    </p>
                  )}
                </div>
              </FormField>

              <div className="flex items-end">
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      const prenom = document.querySelector('input[name="prenom"]')?.value || '';
                      const nom = document.querySelector('input[name="nom"]')?.value || '';
                      if (prenom && nom) {
                        const newPassword = generatePassword(prenom, nom);
                        setGeneratedPassword(newPassword);
                        setValue('password', newPassword);
                      }
                    }}
                    className="px-4 py-2 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
                  >
                    Régénérer le mot de passe
                  </button>
                )}
              </div>
            </div>



            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/employes')}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Sauvegarde...' : (isEditing ? 'Modifier' : 'Créer')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 