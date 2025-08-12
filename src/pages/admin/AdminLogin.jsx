import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Shield, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/shared/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/shared/Card';
import ErrorMessage from '../../components/shared/ErrorMessage';
import FormField, { Input } from '../../components/shared/FormField';
import Logo from '../../components/shared/Logo';
import { useAdminAuth } from '../../hooks/useAdminAuth.jsx';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAdminAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: 'admin',
      password: 'admin123',
    },
  });

  const onSubmit = async (data) => {
    setLoginError('');
    const result = await login(data.username, data.password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setLoginError(result.error);
    }
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
            Administration
          </h1>
          <p className="text-gray-600">
            Connectez-vous pour accéder au panneau d'administration
          </p>
        </div>

        {/* Formulaire de connexion */}
        <Card>
          <CardHeader>
            <CardTitle>Connexion administrateur</CardTitle>
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
                label="Nom d'utilisateur"
                error={errors.username?.message}
                required
              >
                <Input
                  {...register('username', {
                    required: 'Le nom d\'utilisateur est obligatoire'
                  })}
                  placeholder="admin"
                  error={errors.username}
                  autoComplete="username"
                />
              </FormField>

              <FormField
                label="Mot de passe"
                error={errors.password?.message}
                required
              >
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: 'Le mot de passe est obligatoire'
                    })}
                    placeholder="••••••••"
                    error={errors.password}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </FormField>

              <Button
                type="submit"
                className="w-full justify-center"
              >
                Se connecter
              </Button>
            </form>
            
            {/* Test account info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Compte de test :</h4>
              <div className="text-xs text-blue-700">
                <div><strong>Admin:</strong> admin / admin123</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lien retour */}
        <div className="text-center">
          <Button
            as="a"
            href="/"
            variant="ghost"
            className="text-gray-600"
          >
            ← Retour à l'application
          </Button>
        </div>
      </div>
    </div>
  );
}
