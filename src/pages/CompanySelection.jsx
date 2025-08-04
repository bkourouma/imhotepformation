import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Search, Building2, Plus, ArrowRight } from 'lucide-react';
import Button from '../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/shared/Card';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import ErrorMessage from '../components/shared/ErrorMessage';
import FormField, { Input } from '../components/shared/FormField';
import Logo from '../components/shared/Logo';
import { useApi, useCrud, useSearch } from '../hooks/useApi';
import { useCompanySession } from '../hooks/useCompanySession.jsx';
import { entreprisesService } from '../services/api';
import { validation } from '../utils/helpers';

export default function CompanySelection() {
  const navigate = useNavigate();
  const { selectCompany } = useCompanySession();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Recherche d'entreprises
  const { query, setQuery, results, loading: searchLoading } = useSearch(
    entreprisesService.getAll,
    300
  );

  // Toutes les entreprises pour l'affichage initial
  const { data: allCompanies, loading: companiesLoading } = useApi(
    entreprisesService.getAll,
    []
  );

  // CRUD pour créer une nouvelle entreprise
  const { create, loading: createLoading, error: createError } = useCrud(entreprisesService);

  // Formulaire de création
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      raison_sociale: '',
      telephone: '',
      email: '',
    },
  });

  // Entreprises à afficher (résultats de recherche ou toutes)
  const displayedCompanies = query ? results : (allCompanies || []);

  // Sélectionner une entreprise existante
  const handleSelectCompany = (company) => {
    selectCompany(company);
    navigate('/dashboard');
  };

  // Créer une nouvelle entreprise
  const handleCreateCompany = async (data) => {
    try {
      const newCompany = await create(data);
      selectCompany(newCompany);
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la création de l\'entreprise:', error);
    }
  };

  if (companiesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Chargement des entreprises..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo variant="default" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue sur la plateforme de formations
          </h1>
          <p className="text-lg text-gray-600">
            Pour commencer, sélectionnez votre entreprise ou créez-en une nouvelle
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sélection d'entreprise existante */}
          <Card>
            <CardHeader>
              <CardTitle>Sélectionner votre entreprise</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Barre de recherche */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher votre entreprise..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Liste des entreprises */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {searchLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : displayedCompanies.length > 0 ? (
                  displayedCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors"
                      onClick={() => handleSelectCompany(company)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {company.raison_sociale}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {company.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {company.telephone}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {query ? 'Aucune entreprise trouvée' : 'Aucune entreprise disponible'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Création d'entreprise */}
          <Card>
            <CardHeader>
              <CardTitle>Créer une nouvelle entreprise</CardTitle>
            </CardHeader>
            <CardContent>
              {!showCreateForm ? (
                <div className="text-center py-8">
                  <Plus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 mb-6">
                    Votre entreprise n'est pas dans la liste ?<br />
                    Créez-la en quelques clics.
                  </p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    Créer mon entreprise
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(handleCreateCompany)} className="space-y-4">
                  {createError && (
                    <ErrorMessage 
                      error={createError} 
                      title="Erreur lors de la création"
                    />
                  )}

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
                          message: 'Au moins 2 caractères requis'
                        }
                      })}
                      placeholder="Ex: TechCorp Solutions"
                      error={errors.raison_sociale}
                    />
                  </FormField>

                  <FormField
                    label="Email"
                    error={errors.email?.message}
                    required
                  >
                    <Input
                      type="email"
                      {...register('email', {
                        required: 'L\'email est obligatoire',
                        validate: {
                          isEmail: (value) => validation.email(value) || 'Email invalide'
                        }
                      })}
                      placeholder="contact@techcorp.fr"
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
                        required: 'Le téléphone est obligatoire',
                        validate: {
                          isPhone: (value) => validation.phone(value) || 'Téléphone invalide'
                        }
                      })}
                      placeholder="01 23 45 67 89"
                      error={errors.telephone}
                    />
                  </FormField>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowCreateForm(false);
                        reset();
                      }}
                      className="flex-1"
                    >
                      Annuler
                    </Button>
                    <Button
                      type="submit"
                      loading={createLoading}
                      className="flex-1"
                    >
                      Créer et continuer
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
