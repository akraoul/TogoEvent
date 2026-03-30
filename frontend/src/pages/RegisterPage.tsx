import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon, BuildingOfficeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  userType: 'user' | 'organizer';
  companyName?: string;
  companyDescription?: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'user',
    companyName: '',
    companyDescription: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validation
    const newErrors: {[key: string]: string} = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    if (!formData.password) newErrors.password = 'Le mot de passe est requis';
    if (formData.password.length < 6) newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    
    if (formData.userType === 'organizer') {
      if (!formData.companyName?.trim()) newErrors.companyName = 'Le nom de l\'entreprise est requis';
      if (!formData.companyDescription?.trim()) newErrors.companyDescription = 'La description de l\'entreprise est requise';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Simuler l'inscription
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Stocker les infos d'inscription
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userType', formData.userType);
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
      
      if (formData.userType === 'organizer') {
        localStorage.setItem('companyName', formData.companyName || '');
        localStorage.setItem('companyDescription', formData.companyDescription || '');
      }
      
      // Redirection automatique
      navigate(formData.userType === 'organizer' ? '/organizer' : '/');
    } catch (error) {
      setErrors({ general: 'Erreur d\'inscription. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Créer votre compte TogoEvents
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Rejoignez la plus grande plateforme d'événements au Togo
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
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

            {/* Informations personnelles */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  Prénom *
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className={`input-field ${errors.firstName ? 'input-field-error' : ''}`}
                  placeholder="Jean"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Nom *
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className={`input-field ${errors.lastName ? 'input-field-error' : ''}`}
                  placeholder="Dupont"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
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

            {/* Téléphone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Téléphone *
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className={`input-field ${errors.phone ? 'input-field-error' : ''}`}
                placeholder="+228 90 12 34 56"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Informations entreprise (organisateur uniquement) */}
            {formData.userType === 'organizer' && (
              <>
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Nom de l'entreprise *
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className={`input-field ${errors.companyName ? 'input-field-error' : ''}`}
                    placeholder="Togo Events SARL"
                  />
                  {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                </div>

                <div>
                  <label htmlFor="companyDescription" className="block text-sm font-medium text-gray-700">
                    Description de l'entreprise *
                  </label>
                  <textarea
                    id="companyDescription"
                    value={formData.companyDescription}
                    onChange={(e) => setFormData({...formData, companyDescription: e.target.value})}
                    className={`input-field ${errors.companyDescription ? 'input-field-error' : ''}`}
                    rows={3}
                    placeholder="Description de votre entreprise et des événements que vous organisez..."
                  />
                  {errors.companyDescription && <p className="text-red-500 text-sm mt-1">{errors.companyDescription}</p>}
                </div>
              </>
            )}

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe *
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

            {/* Confirmation mot de passe */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className={`input-field pr-10 ${errors.confirmPassword ? 'input-field-error' : ''}`}
                  placeholder="•••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Erreur générale */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Bouton d'inscription */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Inscription en cours...' : 'Créer mon compte'}
              </button>
            </div>

            {/* Lien vers connexion */}
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Déjà un compte ?{' '}
                <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
                  Se connecter
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
