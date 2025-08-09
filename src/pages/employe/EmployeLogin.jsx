import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import ErrorMessage from '../../components/shared/ErrorMessage';
import FormField, { Input } from '../../components/shared/FormField';
import Logo from '../../components/shared/Logo';
import { useEmployeAuth } from '../../hooks/useEmployeAuth.jsx';

export default function EmployeLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useEmployeAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/employe/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: 'fatou.kone@bmi.ci',
      password: 'kf3456',
    },
  });

  const onSubmit = async (data) => {
    setLoginError('');
    setIsLoading(true);
    
    const result = await login(data.email, data.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setLoginError(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo variant="default" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Espace Employé
          </h1>
          <p className="text-gray-600">
            Connectez-vous pour accéder à vos formations
          </p>
        </div>

        {/* Formulaire de connexion */}
        <Card>
          <CardHeader>
            <CardTitle>Connexion employé</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {loginError && (
                <ErrorMessage 
                  error={loginError} 
                  title="Erreur de connexion"
                />
              )}

              <FormField
                label="Email"
                error={errors.email?.message}
                required
              >
                <Input
                  {...register('email', {
                    required: 'L\'email est obligatoire',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide'
                    }
                  })}
                  placeholder="votre.email@entreprise.com"
                  error={errors.email}
                  autoComplete="email"
                  disabled={isLoading}
                />
              </FormField>

              <FormField
                label="Mot de passe"
                error={errors.password?.message}
                required
              >
                <div className="relative">
                  <Input
                    {...register('password', {
                      required: 'Le mot de passe est obligatoire'
                    })}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Votre mot de passe"
                    error={errors.password}
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </FormField>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connexion...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Se connecter
                  </div>
                )}
              </Button>
            </form>
            
            {/* Test accounts info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Comptes de test disponibles :</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div><strong>Fatou Koné:</strong> fatou.kone@bmi.ci / kf3456</div>
                <div><strong>Moussa Traoré:</strong> moussa.traore@bmi.ci / tm7890</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Contactez votre administrateur si vous avez oublié vos identifiants
          </p>
        </div>
      </div>
    </div>
  );
}
