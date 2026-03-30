import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, BuildingOfficeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface LoginFormData {
  email: string;
  password: string;
  userType: 'user' | 'organizer';
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    userType: 'user'
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validation
    const newErrors: {[key: string]: string} = {};
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Simuler la connexion
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Stocker les infos de connexion
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userType', formData.userType);
      localStorage.setItem('userEmail', formData.email);
      
      // Redirection selon le type d'utilisateur
      if (formData.userType === 'organizer') {
        navigate('/organizer');
      } else {
        navigate('/');
      }
    } catch (error) {
      setErrors({ general: 'Erreur de connexion. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Connexion à TogoEvents
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Accédez à votre compte pour gérer vos événements
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Choix du type de compte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type de compte
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, userType: 'user'})}
                  className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                    formData.userType === 'user'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <UserIcon className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">Utilisateur</span>
                  <span className="text-xs text-gray-500 mt-1">Acheter des billets</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({...formData, userType: 'organizer'})}
                  className={`flex flex-col items-center p-4 border-2 rounded-lg transition-colors ${
                    formData.userType === 'organizer'
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <BuildingOfficeIcon className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">Organisateur</span>
                  <span className="text-xs text-gray-500 mt-1">Créer des événements</span>
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`input-field ${errors.email ? 'input-field-error' : ''}`}
                placeholder="exemple@email.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`input-field pr-10 ${errors.password ? 'input-field-error' : ''}`}
                  placeholder="•••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Erreur générale */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Bouton de connexion */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </div>

            {/* Lien vers inscription */}
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link to="/register" className="font-medium text-purple-600 hover:text-purple-500">
                  S'inscrire
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
