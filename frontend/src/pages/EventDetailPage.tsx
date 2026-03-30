import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon,
  UserIcon,
  TagIcon,
  TicketIcon,
  StarIcon,
  HeartIcon,
  ShareIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  PhoneIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import { Event, TicketType } from '../types';

// Données mockées - à remplacer par appel API
const mockEvent: Event = {
  id: '1',
  title: '🔥 LA FOUINE EN CONCERT – YAFOHI NATION EXPERIENCE',
  description: `🎭 **YAFOHI NATION EXPERIENCE** - Une soirée inoubliable avec LA FOUINE !

🔥 **Le moment tant attendu** : La star du rap français débarque au Togo pour une concert exceptionnelle qui marquera les esprits.

🎵 **Ce qui vous attend** :
• 2h de show pur avec LA FOUINE
• Les plus grands tubes : "D'un autre", "Capitale du crime", "Allumez la lumière"...
• Guest surprises avec des artistes togolais
• Spectacle son et lumière de qualité internationale

🎪 **Une expérience unique** :
• Palais des Congrès transformé pour l'occasion
• Son et lumière professionnels
• Stands de restauration et de boissons
• Zone VIP avec accès privilégié

⏰ **Programme de la soirée** :
• 19h00 : Ouverture des portes
• 20h00 : Première partie
• 20h30 : Arrivée de LA FOUINE
• 23h30 : Fin du concert

🎯 **Pourquoi venir ?**
C'est plus qu'un concert, c'est une expérience YAFOHI NATION qui va vibrer le Togo !`,
  short_description: 'Soirée exceptionnelle avec LA FOUINE',
  category: { id: '1', name: 'Concert', slug: 'concert', icon: '🎵', color: '#f97316' },
  organizer: { 
    id: '1', 
    company_name: 'Yafohi Nation', 
    is_verified: true, 
    rating: 4.8,
    description: 'Producteur d\'événements de grande envergure au Togo',
    contact_info: {
      email: 'contact@yafohi.tg',
      phone: '+22890123456',
      whatsapp: '+22890123456'
    }
  },
  venue: { 
    id: '1', 
    name: 'Palais des Congrès', 
    address: 'Boulevard de la Marina, Lomé',
    city: { id: '1', name: 'Lomé', slug: 'lome' },
    capacity: 2000 
  },
  start_date: '2026-04-03T20:00:00Z',
  end_date: '2026-04-03T23:30:00Z',
  is_free: false,
  min_price: 15000,
  max_price: 50000,
  cover_image: 'https://via.placeholder.com/800x400/f97316/FFFFFF?text=LA+FOUINE+EN+CONCERT',
  is_featured: true,
  is_promo: true,
  interested_count: 2847,
  ticket_types: [
    {
      id: '1',
      name: 'Entrée Générale',
      description: 'Place assise en catégorie standard',
      price: 15000,
      currency: 'XOF',
      total_available: 1500,
      sold_tickets: 1200,
      available: 300,
      is_sold_out: false,
      is_on_sale: true
    },
    {
      id: '2',
      name: 'Place VIP',
      description: 'Place VIP avec vue privilégiée et accès cocktail',
      price: 50000,
      currency: 'XOF',
      total_available: 200,
      sold_tickets: 180,
      available: 20,
      is_sold_out: false,
      is_on_sale: true
    },
    {
      id: '3',
      name: 'Place Gold',
      description: 'Meilleures places, cocktail exclusif, meet & greet',
      price: 75000,
      currency: 'XOF',
      total_available: 50,
      sold_tickets: 45,
      available: 5,
      is_sold_out: false,
      is_on_sale: true
    }
  ]
};

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedTickets, setSelectedTickets] = useState<{[key: string]: number}>({});
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Simuler le chargement de l'événement
    setEvent(mockEvent);
  }, [id]);

  const handleTicketQuantityChange = (ticketTypeId: string, quantity: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketTypeId]: Math.max(0, quantity)
    }));
  };

  const getTotalQuantity = () => {
    return Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    if (!event) return 0;
    return Object.entries(selectedTickets).reduce((total, [ticketTypeId, quantity]) => {
      const ticketType = event.ticket_types?.find(t => t.id === ticketTypeId);
      return total + (ticketType ? ticketType.price * quantity : 0);
    }, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TG', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEEE d MMMM yyyy | HH\'h\'mm', { locale: fr });
  };

  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.short_description,
        url: window.location.href
      });
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-togo-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'événement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec retour */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/"
              className="flex items-center gap-2 text-togo-orange hover:text-togo-orange/80"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Retour à l'accueil
            </Link>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <HeartIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image principale */}
      <div className="relative">
        <img
          src={event.cover_image}
          alt={event.title}
          className="w-full h-64 md:h-96 object-cover"
        />
        
        {/* Badge promotionnel */}
        {event.is_promo && (
          <div className="absolute top-4 left-4">
            <span className="event-badge event-badge-promo">Promotion</span>
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Titre sur l'image */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">{event.title}</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <TagIcon className="w-4 h-4" />
              {event.category.name}
            </span>
            <span className="flex items-center gap-1">
              <StarIcon className="w-4 h-4" />
              {event.interested_count} intéressés
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Informations clés */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Informations clés</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-togo-orange mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-gray-600">{formatDate(event.start_date)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <ClockIcon className="w-5 h-5 text-togo-orange mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Heure</p>
                    <p className="text-gray-600">20h00 GMT</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPinIcon className="w-5 h-5 text-togo-orange mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium">Lieu</p>
                    <p className="text-gray-600">{event.venue.name}, {event.venue.city.name}</p>
                    <Link 
                      to={`/map/${event.venue.id}`}
                      className="text-togo-orange hover:text-togo-orange/80 text-sm flex items-center gap-1 mt-1"
                    >
                      <MapPinIcon className="w-4 h-4" />
                      Voir sur la carte
                    </Link>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <TagIcon className="w-5 h-5 text-togo-orange mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Catégorie</p>
                    <p className="text-gray-600">{event.category.name}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <UserIcon className="w-5 h-5 text-togo-orange mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Production</p>
                    <p className="text-gray-600">{event.organizer.company_name}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">À propos de cet événement</h2>
              <div className="prose prose-gray max-w-none">
                <div dangerouslySetInnerHTML={{ __html: event.description.replace(/\n/g, '<br>') }} />
              </div>
            </div>

            {/* Organisateur */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Publié par {event.organizer.company_name}</h2>
                {event.organizer.is_verified && (
                  <span className="flex items-center gap-1 text-togo-green">
                    <ShieldCheckIcon className="w-5 h-5" />
                    Vérifié
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  <StarIcon className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">{event.organizer.rating}</span>
                </div>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">{event.interested_count} abonnés</span>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleSubscribe}
                  className={`btn-subscribe ${isSubscribed ? 'bg-gray-200 text-gray-700' : ''}`}
                >
                  {isSubscribed ? 'Abonné' : 'S\'abonner'}
                </button>
                <Link 
                  to={`/organizer/${event.organizer.id}`}
                  className="btn-outline"
                >
                  Voir le profil
                </Link>
              </div>
            </div>

            {/* Lieu sur carte */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Lieu sur carte</h2>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <MapPinIcon className="w-12 h-12 mx-auto mb-2" />
                  <p>Carte interactive</p>
                  <p className="text-sm">{event.venue.name}, {event.venue.city.name}</p>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Questions fréquentes</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <PhoneIcon className="w-5 h-5 text-togo-orange" />
                    Comment payer avec Mobile Money ?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Vous pouvez payer avec T-Money, Flooz, Wave, Orange Money ou MTN MoMo. 
                    Sélectionnez votre moyen de paiement lors du checkout et suivez les instructions.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-purple-600" />
                    Lieu de l'événement
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {event.venue.name} - {event.venue.city.name}
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2 flex items-center gap-2">
                    <QuestionMarkCircleIcon className="w-5 h-5 text-togo-orange" />
                    Comment contacter le support ?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Contactez-nous par WhatsApp au +22890123456 ou par email à support@togoevents.tg
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Choix des tickets */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Choisissez vos tickets</h2>
              
              {/* Types de tickets */}
              <div className="space-y-4 mb-6">
                {event.ticket_types?.map((ticketType) => (
                  <div key={ticketType.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{ticketType.name}</h3>
                        <p className="text-sm text-gray-600">{ticketType.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-togo-orange">{formatPrice(ticketType.price)}</p>
                        <p className="text-xs text-gray-600">
                          {ticketType.available} disponibles
                        </p>
                      </div>
                    </div>
                    
                    {!ticketType.is_sold_out ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Quantité</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTicketQuantityChange(ticketType.id, (selectedTickets[ticketType.id] || 0) - 1)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{selectedTickets[ticketType.id] || 0}</span>
                          <button
                            onClick={() => handleTicketQuantityChange(ticketType.id, (selectedTickets[ticketType.id] || 0) + 1)}
                            className="w-8 h-8 rounded-full bg-togo-orange text-white hover:bg-togo-orange/90 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span className="text-red-600 text-sm font-medium">Complet</span>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Total et action */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Votre commande</span>
                  <span className="text-xl font-bold text-togo-orange">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
                
                {getTotalQuantity() > 0 && (
                  <p className="text-sm text-gray-600 mb-4">
                    {getTotalQuantity()} billet{getTotalQuantity() > 1 ? 's' : ''} sélectionné{getTotalQuantity() > 1 ? 's' : ''}
                  </p>
                )}
                
                <div className="bg-togo-orange/10 border border-togo-orange/20 rounded-lg p-3 mb-4">
                  <p className="text-sm text-togo-orange font-medium flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4" />
                    Places limitées – Réserve la tienne dès maintenant !
                  </p>
                </div>
                
                <Link 
                  to="/checkout"
                  state={{ 
                    eventId: event.id, 
                    selectedTickets,
                    totalPrice: getTotalPrice()
                  }}
                  className={`btn-primary w-full text-center ${
                    getTotalQuantity() === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={(e) => getTotalQuantity() === 0 && e.preventDefault()}
                >
                  {getTotalQuantity() > 0 ? 'Aller au paiement' : 'Sélectionnez des tickets'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
