import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PhoneIcon,
  ShieldCheckIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Event } from '../types';

interface CheckoutState {
  eventId: string;
  selectedTickets: { [key: string]: number };
  totalPrice: number;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CheckoutState;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<{[key: string]: number}>({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('tmoney');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    whatsapp: '',
    email: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Données mockées pour l'événement
  const mockEvent: Event = useMemo(() => ({
    id: '1',
    title: '🔥 LA FOUINE EN CONCERT – YAFOHI NATION EXPERIENCE',
    description: 'Soirée exceptionnelle avec LA FOUINE',
    short_description: 'Le concert tant attendu',
    category: { id: '1', name: 'Concert', slug: 'concert', icon: '🎵', color: '#f97316' },
    organizer: { id: '1', company_name: 'Yafohi Nation', is_verified: true, rating: 4.8 },
    venue: { id: '1', name: 'Palais des Congrès', address: 'Boulevard de la Marina, Lomé', city: { id: '1', 'name': 'Lomé', 'slug': 'lome' }, capacity: 2000 },
    start_date: '2026-04-03T20:00:00Z',
    end_date: '2026-04-03T23:30:00Z',
    is_free: false,
    min_price: 15000,
    max_price: 50000,
    cover_image: 'https://via.placeholder.com/400x300/f97316/FFFFFF?text=LA+FOUINE',
    is_featured: true,
    ticket_types: [
      {
        id: '1', name: 'Entrée Générale', description: 'Place assise en catégorie standard',
        price: 15000, currency: 'XOF', total_available: 1500, sold_tickets: 1200,
        available: 300, is_sold_out: false, is_on_sale: true
      },
      {
        id: '2', name: 'Place VIP', description: 'Place VIP avec vue privilégiée',
        price: 50000, currency: 'XOF', total_available: 200, sold_tickets: 180,
        available: 20, is_sold_out: false, is_on_sale: true
      }
    ]
  }), []);

  useEffect(() => {
    if (state) {
      setSelectedTickets(state.selectedTickets);
      setTotalPrice(state.totalPrice);
    }
    setEvent(mockEvent);
  }, [state, mockEvent]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TG', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est requis';
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis';
    if (!formData.phone.match(/^\+228[0-9]{8}$/)) newErrors.phone = 'Numéro togolais invalide (+228 XX XX XX XX)';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      // Simuler l'appel API de paiement
      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event?.id,
          ticket_types: Object.entries(selectedTickets).map(([id, qty]) => ({ ticket_type_id: id, quantity: qty })),
          payment_method: paymentMethod,
          user_info: formData
        })
      });
      
      const result = await response.json();
      
      if (result.status === 'completed') {
        // Rediriger vers la page de confirmation
        navigate('/payment-success', { 
          state: { 
            paymentId: result.payment_id, 
            transactionId: result.transaction_id,
            event,
            selectedTickets,
            totalPrice
          } 
        });
      } else {
        setErrors({ general: 'Le paiement a échoué. Veuillez réessayer.' });
      }
    } catch (error) {
      setErrors({ general: 'Une erreur est survenue. Veuillez réessayer.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentMethods = [
    { id: 'tmoney', name: 'T-Money', icon: '🟠', priority: 1 },
    { id: 'flooz', name: 'Flooz', icon: '🔵', priority: 2 },
    { id: 'wave', name: 'Wave', icon: '🟡', priority: 3 },
    { id: 'orange_money', name: 'Orange Money', icon: '🟠', priority: 4 },
    { id: 'mtn_momo', name: 'MTN MoMo', icon: '🟢', priority: 5 },
    { id: 'visa', name: 'Visa', icon: '💳', priority: 6 },
    { id: 'mastercard', name: 'Mastercard', icon: '💳', priority: 7 }
  ];

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link 
            to={`/event/${event.id}`}
            className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Retour à l'événement
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulaire principal */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h1 className="text-2xl font-bold mb-6">Finaliser votre commande</h1>
                
                {/* Récapitulatif */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <h2 className="font-semibold text-orange-800 mb-3">Votre commande</h2>
                  <div className="space-y-2">
                    <p className="text-orange-700 font-medium">{event.title}</p>
                    <div className="text-sm text-orange-600">
                      {Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => {
                        const ticketType = event.ticket_types?.find(t => t.id === ticketTypeId);
                        if (!ticketType || quantity === 0) return null;
                        return (
                          <div key={ticketTypeId} className="flex justify-between">
                            <span>{quantity} × {ticketType.name}</span>
                            <span>{formatPrice(ticketType.price * quantity)}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-orange-200 pt-2 mt-2">
                      <div className="flex justify-between font-bold text-orange-800">
                        <span>Total</span>
                        <span className="text-xl">{formatPrice(totalPrice)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informations personnelles */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Prénom *
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className={`input-field ${errors.firstName ? 'input-field-error' : ''}`}
                          placeholder="Votre prénom"
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom *
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className={`input-field ${errors.lastName ? 'input-field-error' : ''}`}
                          placeholder="Votre nom"
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone WhatsApp *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className={`input-field ${errors.phone ? 'input-field-error' : ''}`}
                        placeholder="+228 XX XX XX XX"
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp (si différent)
                      </label>
                      <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                        className="input-field"
                        placeholder="+228 XX XX XX XX"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email (optionnel)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="input-field"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  {/* Moyens de paiement */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Moyen de paiement</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setPaymentMethod(method.id)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            paymentMethod === method.id
                              ? 'border-orange-500 bg-orange-50 shadow-lg'
                              : 'border-gray-200 hover:border-orange-300 bg-white'
                          }`}
                        >
                          <div className="text-2xl mb-1">{method.icon}</div>
                          <div className="text-sm font-medium">{method.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message d'erreur général */}
                  {errors.general && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700">{errors.general}</p>
                    </div>
                  )}

                  {/* Bouton de paiement */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Traitement en cours...
                      </div>
                    ) : (
                      `Payer ${formatPrice(totalPrice)}`
                    )}
                  </button>
                </form>
              </div>

              {/* Sécurité */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-green-800 mb-2">Paiement sécurisé</h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li className="flex items-center gap-2">
                        <CheckIcon className="w-4 h-4" />
                        Transactions cryptées SSL 256-bit
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckIcon className="w-4 h-4" />
                        Protection contre la fraude
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckIcon className="w-4 h-4" />
                        Support client 24/7
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h3 className="text-lg font-semibold mb-4">Récapitulatif</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                      🎭
                    </div>
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-600">{event.venue.name}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      {Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => {
                        const ticketType = event.ticket_types?.find(t => t.id === ticketTypeId);
                        if (!ticketType || quantity === 0) return null;
                        return (
                          <div key={ticketTypeId} className="flex justify-between text-sm">
                            <span>{quantity} × {ticketType.name}</span>
                            <span>{formatPrice(ticketType.price * quantity)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total</span>
                      <span className="text-xl font-bold text-orange-600">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Support client */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Besoin d'aide pour votre achat ?
                  </p>
                  <a
                    href="tel:+22890123456"
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                  >
                    <PhoneIcon className="w-4 h-4" />
                    Contacter le support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
