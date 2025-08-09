import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntrepriseAuth } from '../hooks/useEntrepriseAuth';
import { Card, FormField, Button, ErrorMessage } from '../components/shared';
import { Input } from '../components/shared/FormField';

const EntrepriseLogin = () => {
  const [formData, setFormData] = useState({
    email: 'baba.kourouma@allianceconsultants.net',
    password: 'bmi9012'
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerData, setRegisterData] = useState({
    raison_sociale: '',
    email: '',
    telephone: '',
    adresse: '',
    password: '',
    confirmPassword: ''
  });

  const { login, register, loading, error, clearError } = useEntrepriseAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isRegistering) {
      setRegisterData(prev => ({ ...prev, [name]: value }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();

    const result = await login((formData.email || '').trim().toLowerCase(), formData.password);
    if (result.success) {
      navigate('/entreprise/dashboard');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    clearError();

    if (registerData.password !== registerData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    const { confirmPassword, ...entrepriseData } = registerData;
    const result = await register(entrepriseData);
    if (result.success) {
      navigate('/entreprise/dashboard');
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    clearError();
    setFormData({ email: '', password: '' });
    setRegisterData({
      raison_sociale: '',
      email: '',
      telephone: '',
      adresse: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isRegistering ? 'Inscription Entreprise' : 'Connexion Entreprise'}
            </h1>
            <p className="text-gray-600">
              {isRegistering 
                ? 'Créez votre compte entreprise pour accéder à nos formations'
                : 'Connectez-vous à votre espace entreprise'
              }
            </p>
          </div>

          {error && <ErrorMessage message={error} />}

          {isRegistering ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <FormField
                label="Raison sociale"
                required
              >
                <Input
                  name="raison_sociale"
                  type="text"
                  value={registerData.raison_sociale}
                  onChange={handleInputChange}
                  placeholder="Nom de votre entreprise"
                  required
                />
              </FormField>
              <FormField
                label="Email"
                required
              >
                <Input
                  name="email"
                  type="email"
                  value={registerData.email}
                  onChange={handleInputChange}
                  placeholder="contact@entreprise.com"
                  required
                />
              </FormField>
              <FormField
                label="Téléphone"
                required
              >
                <Input
                  name="telephone"
                  type="tel"
                  value={registerData.telephone}
                  onChange={handleInputChange}
                  placeholder="01 23 45 67 89"
                  required
                />
              </FormField>
              <FormField
                label="Adresse"
              >
                <Input
                  name="adresse"
                  type="text"
                  value={registerData.adresse}
                  onChange={handleInputChange}
                  placeholder="Adresse de l'entreprise"
                />
              </FormField>
              <FormField
                label="Mot de passe"
                required
              >
                <Input
                  name="password"
                  type="password"
                  value={registerData.password}
                  onChange={handleInputChange}
                  placeholder="Choisissez un mot de passe"
                  required
                />
              </FormField>
              <FormField
                label="Confirmer le mot de passe"
                required
              >
                <Input
                  name="confirmPassword"
                  type="password"
                  value={registerData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirmez votre mot de passe"
                  required
                />
              </FormField>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Inscription...' : 'S\'inscrire'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <FormField
                label="Email"
                required
              >
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="votre.email@entreprise.com"
                  required
                />
              </FormField>
              <FormField
                label="Mot de passe"
                required
              >
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Votre mot de passe"
                  required
                />
              </FormField>
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              {isRegistering 
                ? 'Déjà un compte ? Se connecter'
                : 'Pas de compte ? S\'inscrire'
              }
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Comptes de test disponibles :</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Digital Innovations:</strong> info@digital-innovations.fr / di1234</p>
                <p><strong>Tech Solutions:</strong> contact@tech-solutions.com / ts5678</p>
                <p><strong>BMI WFS:</strong> baba.kourouma@allianceconsultants.net / bmi9012</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EntrepriseLogin;
