import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PhotoIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface EventFormData {
  title: string;
  description: string; // Gardé pour compatibilité mais non utilisé dans le formulaire
  shortDescription: string;
  categoryId: string;
  venueId: string;
  venueName: string; // Ajout du champ pour saisie manuelle du lieu
  venueAddress: string; // Ajout du champ pour l'adresse
  startDate: string;
  endDate: string; // Gardé pour compatibilité mais sera calculé automatiquement
  isFree: boolean;
  minPrice: number;
  maxPrice: number;
  coverImage: string;
  isFeatured: boolean;
  isPromo: boolean;
  isEarlyBird: boolean;
  totalCapacity: number;
  ticketTypes: TicketTypeData[];
  termsAccepted: boolean; // Ajout du champ pour les conditions
}

interface TicketTypeData {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  totalAvailable: number;
  isOnSale: boolean;
  saleStartDate: string;
  saleEndDate: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
}

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Vérifier si l'utilisateur est un organisateur
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    
    if (!isLoggedIn || userType !== 'organizer') {
      // Rediriger vers la page de connexion si ce n'est pas un organisateur
      navigate('/login');
      return;
    }
  }, [navigate]);
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    venueId: '',
    venueName: '',
    venueAddress: '',
    startDate: '',
    endDate: '',
    isFree: false,
    minPrice: 0,
    maxPrice: 0,
    coverImage: '',
    isFeatured: false,
    isPromo: false,
    isEarlyBird: false,
    totalCapacity: 0,
    ticketTypes: [],
    termsAccepted: false
  });

  // Données mockées
  const mockCategories: Category[] = [
    { id: '1', name: 'Concert', slug: 'concert', icon: '🎵', color: '#f97316' },
    { id: '2', name: 'Festival', slug: 'festival', icon: '🎭', color: '#22c55e' },
    { id: '3', name: 'Théâtre', slug: 'theatre', icon: '🎪', color: '#6366f1' },
    { id: '4', name: 'Danse', slug: 'danse', icon: '💃', color: '#ec4899' },
    { id: '5', name: 'Exposition', slug: 'exposition', icon: '🎨', color: '#8b5cf6' },
    { id: '6', name: 'Autre', slug: 'autre', icon: '📅', color: '#6b7280' }
  ];

  const addTicketType = () => {
    const newTicketType: TicketTypeData = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
      currency: 'XOF',
      totalAvailable: 0,
      isOnSale: true,
      saleStartDate: '',
      saleEndDate: ''
    };
    setFormData(prev => ({
      ...prev,
      ticketTypes: [...prev.ticketTypes, newTicketType]
    }));
  };

  const removeTicketType = (id: string) => {
    setFormData(prev => ({
      ...prev,
      ticketTypes: prev.ticketTypes.filter(tt => tt.id !== id)
    }));
  };

  const updateTicketType = (id: string, field: keyof TicketTypeData, value: any) => {
    setFormData(prev => {
      if (!prev.ticketTypes) return prev;
      
      const updatedTicketTypes = prev.ticketTypes.map(tt => 
        tt.id === id ? { ...tt, [field]: value } : tt
      );
      
      // Effacer les erreurs quand l'utilisateur corrige
      if (field === 'name' && value.trim()) {
        setErrors(errors => {
          const newErrors = { ...errors };
          const index = updatedTicketTypes.findIndex(tt => tt.id === id);
          if (index !== -1) {
            delete newErrors[`ticket_${index}_name`];
          }
          return newErrors;
        });
      }
      
      if (field === 'price' && value > 0) {
        setErrors(errors => {
          const newErrors = { ...errors };
          const index = updatedTicketTypes.findIndex(tt => tt.id === id);
          if (index !== -1) {
            delete newErrors[`ticket_${index}_price`];
          }
          return newErrors;
        });
      }
      
      if (field === 'totalAvailable' && value > 0) {
        setErrors(errors => {
          const newErrors = { ...errors };
          const index = updatedTicketTypes.findIndex(tt => tt.id === id);
          if (index !== -1) {
            delete newErrors[`ticket_${index}_total`];
          }
          return newErrors;
        });
      }
      
      return {
        ...prev,
        ticketTypes: updatedTicketTypes
      };
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Le titre est requis';
      // Description courte maintenant optionnelle
      if (!formData.categoryId) newErrors.categoryId = 'La catégorie est requise';
    }
    
    if (step === 2) {
      if (!formData.venueName.trim()) newErrors.venueName = 'Le nom du lieu est requis';
      if (!formData.venueAddress.trim()) newErrors.venueAddress = 'L\'adresse du lieu est requise';
      if (!formData.startDate) newErrors.startDate = 'La date de début est requise';
      if (formData.totalCapacity <= 0) newErrors.totalCapacity = 'La capacité doit être supérieure à 0';
      // Plus besoin de valider endDate - calculé automatiquement
    }
    
    if (step === 3) {
      if (!formData.isFree && (!formData.ticketTypes || formData.ticketTypes.length === 0)) {
        newErrors.ticketTypes = 'Au moins un type de billet est requis';
      }
      
      if (formData.ticketTypes && formData.ticketTypes.length > 0) {
        formData.ticketTypes.forEach((tt, index) => {
          if (!tt.name.trim()) newErrors[`ticket_${index}_name`] = 'Le nom est requis';
          if (!formData.isFree && tt.price <= 0) newErrors[`ticket_${index}_price`] = 'Le prix doit être supérieur à 0';
          if (tt.totalAvailable <= 0) newErrors[`ticket_${index}_total`] = 'Le total doit être supérieur à 0';
        });
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    // Effacer les erreurs générales avant de valider
    setErrors({});
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation finale de toutes les étapes
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);
    
    // Validation des conditions d'utilisation
    if (!formData.termsAccepted) {
      setErrors({ general: 'Vous devez accepter les conditions d\'utilisation pour publier l\'événement.' });
      return;
    }
    
    if (!step1Valid || !step2Valid || !step3Valid) {
      setErrors({ general: 'Veuillez corriger toutes les erreurs avant de publier.' });
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Appel API réel pour créer l'événement
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'demo-token'}`
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.shortDescription || formData.title,
          shortDescription: formData.shortDescription,
          categoryId: formData.categoryId,
          venueName: formData.venueName,
          venueAddress: formData.venueAddress,
          startDate: formData.startDate,
          endDate: formData.endDate || formData.startDate,
          isFree: formData.isFree,
          minPrice: formData.isFree ? 0 : formData.minPrice,
          maxPrice: formData.isFree ? 0 : formData.maxPrice,
          totalCapacity: formData.totalCapacity,
          ticketTypes: formData.ticketTypes.length > 0 ? formData.ticketTypes.map(tt => ({
            name: tt.name,
            description: tt.description,
            price: tt.price,
            quantity: tt.totalAvailable
          })) : [],
          isFeatured: formData.isFeatured,
          isPromo: formData.isPromo,
          coverImage: formData.coverImage
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        
        // Si l'API n'est pas disponible, utiliser le mode démo
        if (response.status === 0 || response.type === 'opaque') {
          throw new Error('API_UNAVAILABLE');
        }
        
        // Afficher l'erreur spécifique de l'API
        if (errorData.error) {
          setErrors({ general: errorData.error });
          return;
        }
        
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      // S'assurer que tous les champs requis sont présents
      const eventData = {
        ...formData,
        id: result.id || Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'published',
        description: formData.shortDescription || formData.title,
        venue: {
          id: formData.venueId || 'custom',
          name: formData.venueName || 'Lieu de l\'événement',
          address: formData.venueAddress || 'Adresse',
          city: { id: '1', name: 'Lomé', slug: 'lome' },
          capacity: formData.totalCapacity || 100
        },
        // S'assurer que les champs de prix sont corrects
        minPrice: formData.isFree ? 0 : formData.minPrice,
        maxPrice: formData.isFree ? 0 : formData.maxPrice,
        // S'assurer que les tickets sont bien présents
        ticketTypes: formData.ticketTypes.length > 0 ? formData.ticketTypes : [{
          id: '1',
          name: 'Standard',
          price: formData.isFree ? 0 : 5000,
          quantity: formData.totalCapacity || 100,
          available: formData.totalCapacity || 100,
          description: 'Billets standard'
        }]
      };
      
      // Stocker l'événement créé dans localStorage pour la démo
      const existingEvents = JSON.parse(localStorage.getItem('createdEvents') || '[]');
      localStorage.setItem('createdEvents', JSON.stringify([...existingEvents, eventData]));
      
      // Nettoyer le formulaire
      setFormData({
        title: '',
        description: '',
        shortDescription: '',
        categoryId: '',
        venueId: '',
        venueName: '',
        venueAddress: '',
        startDate: '',
        endDate: '',
        isFree: false,
        minPrice: 0,
        maxPrice: 0,
        coverImage: '',
        isFeatured: false,
        isPromo: false,
        isEarlyBird: false,
        totalCapacity: 0,
        ticketTypes: [],
        termsAccepted: false
      });
      setCurrentStep(1);
      
      navigate('/organizer', { 
        state: { 
          message: 'Événement créé avec succès !',
          type: 'success',
          event: eventData
        } 
      });
    } catch (error) {
      console.error('Error creating event:', error);
      
      // Si l'API n'est pas disponible, utiliser le mode démo
      if (error.message === 'API_UNAVAILABLE' || error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
        console.log('Backend non disponible, utilisation du mode démo');
        
        // Simuler la création d'événement avec succès
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 201,
              json: () => Promise.resolve({
                id: Date.now().toString(),
                message: 'Événement créé avec succès (mode démo)'
              })
            });
          }, 1500);
        });
        
        // S'assurer que tous les champs requis sont présents
        const eventData = {
          ...formData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          status: 'published',
          description: formData.shortDescription || formData.title,
          venue: {
            id: formData.venueId || 'custom',
            name: formData.venueName || 'Lieu de l\'événement',
            address: formData.venueAddress || 'Adresse',
            city: { id: '1', name: 'Lomé', slug: 'lome' },
            capacity: formData.totalCapacity || 100
          },
          // S'assurer que les champs de prix sont corrects
          minPrice: formData.isFree ? 0 : formData.minPrice,
          maxPrice: formData.isFree ? 0 : formData.maxPrice,
          // S'assurer que les tickets sont bien présents
          ticketTypes: formData.ticketTypes.length > 0 ? formData.ticketTypes : [{
            id: '1',
            name: 'Standard',
            price: formData.isFree ? 0 : 5000,
            quantity: formData.totalCapacity || 100,
            available: formData.totalCapacity || 100,
            description: 'Billets standard'
          }]
        };
        
        // Stocker l'événement créé dans localStorage
        const existingEvents = JSON.parse(localStorage.getItem('createdEvents') || '[]');
        localStorage.setItem('createdEvents', JSON.stringify([...existingEvents, eventData]));
        
        // Nettoyer le formulaire
        setFormData({
          title: '',
          description: '',
          shortDescription: '',
          categoryId: '',
          venueId: '',
          venueName: '',
          venueAddress: '',
          startDate: '',
          endDate: '',
          isFree: false,
          minPrice: 0,
          maxPrice: 0,
          coverImage: '',
          isFeatured: false,
          isPromo: false,
          isEarlyBird: false,
          totalCapacity: 0,
          ticketTypes: [],
          termsAccepted: false
        });
        setCurrentStep(1);
        
        navigate('/organizer', { 
          state: { 
            message: 'Événement créé avec succès (mode démo) !',
            type: 'success',
            event: eventData
          } 
        });
      } else {
        console.error('Erreur détaillée:', error);
        const errorMessage = error.message || 'Une erreur est survenue. Veuillez réessayer.';
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TG', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Informations', icon: '📝' },
      { number: 2, title: 'Lieu & Date', icon: '📍' },
      { number: 3, title: 'Billets', icon: '🎫' },
      { number: 4, title: 'Publication', icon: '✅' }
    ];

    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-200 ${
              currentStep >= step.number
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step.icon}
            </div>
            <div className={`ml-3 flex-1 ${index < steps.length - 1 ? 'mr-3' : ''}`}>
              <p className={`font-medium ${currentStep >= step.number ? 'text-orange-600' : 'text-gray-600'}`}>
                {step.title}
              </p>
              {index < steps.length - 1 && (
                <div className={`h-1 mt-2 rounded-full transition-all duration-200 ${
                  currentStep > step.number ? 'bg-orange-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link 
            to="/organizer"
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Retour au dashboard
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Créer un nouvel événement
            </h1>
            <p className="text-gray-600 mb-8">
              Remplissez les informations pour créer votre événement culturel
            </p>

            {renderStepIndicator()}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Étape 1: Informations de base */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Informations de base</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre de l'événement *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className={`input-field ${errors.title ? 'input-field-error' : ''}`}
                      placeholder="Ex: LA FOUINE EN CONCERT"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description courte
                    </label>
                    <input
                      type="text"
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                      className={`input-field ${errors.shortDescription ? 'input-field-error' : ''}`}
                      placeholder="Résumé en une phrase (optionnel)"
                    />
                    {errors.shortDescription && <p className="text-red-500 text-sm mt-1">{errors.shortDescription}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie *
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                      className={`input-field ${errors.categoryId ? 'input-field-error' : ''}`}
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {mockCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Options de visibilité</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="ml-2 text-gray-700">Mettre en vedette</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isPromo}
                          onChange={(e) => setFormData({...formData, isPromo: e.target.checked})}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="ml-2 text-gray-700">Événement promotionnel</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.isEarlyBird}
                          onChange={(e) => setFormData({...formData, isEarlyBird: e.target.checked})}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="ml-2 text-gray-700">Offre Early Bird</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 2: Lieu et Date */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Lieu et Date</h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du lieu *
                    </label>
                    <input
                      type="text"
                      value={formData.venueName}
                      onChange={(e) => setFormData({...formData, venueName: e.target.value})}
                      className={`input-field ${errors.venueName ? 'input-field-error' : ''}`}
                      placeholder="Ex: Palais des Congrès, Stade de Kégué"
                    />
                    {errors.venueName && <p className="text-red-500 text-sm mt-1">{errors.venueName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse du lieu *
                    </label>
                    <input
                      type="text"
                      value={formData.venueAddress}
                      onChange={(e) => setFormData({...formData, venueAddress: e.target.value})}
                      className={`input-field ${errors.venueAddress ? 'input-field-error' : ''}`}
                      placeholder="Ex: Rue du Commerce, Lomé, Togo"
                    />
                    {errors.venueAddress && <p className="text-red-500 text-sm mt-1">{errors.venueAddress}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date et heure de l'événement *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => {
                        const newStartDate = e.target.value;
                        // Calculer automatiquement la date de fin (4 heures après le début)
                        const startDate = new Date(newStartDate);
                        const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // +4 heures
                        const endDateString = endDate.toISOString().slice(0, 16);
                        
                        setFormData({
                          ...formData, 
                          startDate: newStartDate,
                          endDate: endDateString
                        });
                      }}
                      className={`input-field ${errors.startDate ? 'input-field-error' : ''}`}
                    />
                    {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                    <p className="text-sm text-gray-500 mt-1">
                      L'événement durera automatiquement 4 heures
                    </p>
                  </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacité totale *
                    </label>
                    <input
                      type="number"
                      value={formData.totalCapacity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setFormData({...formData, totalCapacity: value});
                        // Effacer l'erreur quand l'utilisateur corrige
                        if (value > 0) {
                          setErrors(errors => {
                            const newErrors = { ...errors };
                            delete newErrors.totalCapacity;
                            return newErrors;
                          });
                        }
                      }}
                      className={`input-field ${errors.totalCapacity ? 'input-field-error' : ''}`}
                      placeholder="Nombre total de places"
                      min="1"
                    />
                    {errors.totalCapacity && <p className="text-red-500 text-sm mt-1">{errors.totalCapacity}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image de couverture
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">
                        Cliquez pour uploader une image ou glissez-déposez
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG jusqu'à 10MB
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Simuler l'upload
                            setFormData({...formData, coverImage: URL.createObjectURL(file)});
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => document.querySelector('input[type="file"]')?.click()}
                        className="btn-secondary mt-4"
                      >
                        Choisir une image
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 3: Types de billets */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Types de billets</h2>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isFree}
                        onChange={(e) => setFormData({...formData, isFree: e.target.checked})}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="ml-2 text-gray-700">Événement gratuit</span>
                    </label>
                  </div>

                  {!formData.isFree && (
                    <>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={addTicketType}
                          className="btn-primary flex items-center gap-2"
                        >
                          <PlusIcon className="w-5 h-5" />
                          Ajouter un type de billet
                        </button>
                        <p className="text-sm text-gray-600">
                          Ajoutez différents types de billets (VIP, Standard, etc.)
                        </p>
                      </div>

                      {errors.ticketTypes && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-red-700">{errors.ticketTypes}</p>
                        </div>
                      )}

                      {formData.ticketTypes.map((ticketType, index) => (
                        <div key={ticketType.id} className="border border-gray-200 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              Type de billet #{index + 1}
                            </h3>
                            <button
                              type="button"
                              onClick={() => removeTicketType(ticketType.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nom *
                              </label>
                              <input
                                type="text"
                                value={ticketType.name}
                                onChange={(e) => updateTicketType(ticketType.id, 'name', e.target.value)}
                                className={`input-field ${errors[`ticket_${index}_name`] ? 'input-field-error' : ''}`}
                                placeholder="Ex: VIP, Standard"
                              />
                              {errors[`ticket_${index}_name`] && (
                                <p className="text-red-500 text-sm mt-1">{errors[`ticket_${index}_name`]}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prix (FCFA) *
                              </label>
                              <input
                                type="number"
                                value={ticketType.price}
                                onChange={(e) => updateTicketType(ticketType.id, 'price', parseInt(e.target.value) || 0)}
                                className={`input-field ${errors[`ticket_${index}_price`] ? 'input-field-error' : ''}`}
                                placeholder="15000"
                              />
                              {errors[`ticket_${index}_price`] && (
                                <p className="text-red-500 text-sm mt-1">{errors[`ticket_${index}_price`]}</p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                              </label>
                              <input
                                type="text"
                                value={ticketType.description}
                                onChange={(e) => updateTicketType(ticketType.id, 'description', e.target.value)}
                                className="input-field"
                                placeholder="Description du billet"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre disponible *
                              </label>
                              <input
                                type="number"
                                value={ticketType.totalAvailable}
                                onChange={(e) => updateTicketType(ticketType.id, 'totalAvailable', parseInt(e.target.value) || 0)}
                                className={`input-field ${errors[`ticket_${index}_total`] ? 'input-field-error' : ''}`}
                                placeholder="100"
                              />
                              {errors[`ticket_${index}_total`] && (
                                <p className="text-red-500 text-sm mt-1">{errors[`ticket_${index}_total`]}</p>
                              )}
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={ticketType.isOnSale}
                                onChange={(e) => updateTicketType(ticketType.id, 'isOnSale', e.target.checked)}
                                className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                              />
                              <span className="ml-2 text-gray-700">Mettre en vente immédiatement</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </>
                  )}

                  {formData.isFree && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="flex items-center gap-3">
                        <CheckIcon className="w-6 h-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-green-800">Événement gratuit</h3>
                          <p className="text-green-700">
                            Les participants pourront s'inscrire gratuitement à votre événement.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Étape 4: Publication */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Récapitulatif et publication</h2>
                  
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Récapitulatif de l'événement</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{formData.title || 'Non spécifié'}</h4>
                        <p className="text-gray-600">{formData.shortDescription || 'Non spécifié'}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Catégorie</p>
                          <p className="font-medium">
                            {mockCategories.find(c => c.id === formData.categoryId)?.name || 'Non spécifiée'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Lieu</p>
                          <p className="font-medium">
                            {formData.venueName || 'Non spécifié'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formData.venueAddress || 'Adresse non spécifiée'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-medium">
                            {formData.startDate ? new Date(formData.startDate).toLocaleDateString('fr-TG') : 'Non spécifiée'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Capacité</p>
                          <p className="font-medium">
                            {formData.totalCapacity || 'Non spécifiée'} places
                          </p>
                        </div>
                      </div>
                      
                      {!formData.isFree && formData.ticketTypes.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Types de billets</p>
                          <div className="space-y-1">
                            {formData.ticketTypes.map((tt, index) => (
                              <div key={tt.id} className="flex justify-between">
                                <span>{tt.name || `Type ${index + 1}`}</span>
                                <span>{formatPrice(tt.price)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <ExclamationTriangleIcon className="w-6 h-6 text-orange-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-orange-800 mb-2">Important avant de publier</h3>
                        <ul className="text-orange-700 space-y-1 text-sm">
                          <li>• Vérifiez que toutes les informations sont correctes</li>
                          <li>• Assurez-vous d'avoir les droits pour l'événement</li>
                          <li>• Préparez votre plan de communication</li>
                          <li>• Soyez prêt à répondre aux questions des participants</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={formData.termsAccepted}
                      onChange={(e) => setFormData({...formData, termsAccepted: e.target.checked})}
                      className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      Je confirme que toutes les informations sont exactes et j'accepte les conditions d'utilisation
                    </label>
                  </div>
                </div>
              )}

              {/* Message d'erreur général */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700">{errors.general}</p>
                </div>
              )}

              {/* Boutons de navigation */}
              <div className="flex justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={currentStep === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="btn-primary"
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Publication en cours...
                      </div>
                    ) : (
                      'Publier l\'événement'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
