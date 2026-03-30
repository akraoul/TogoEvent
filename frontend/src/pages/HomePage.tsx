import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TicketIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import EventCard from '../components/EventCard.tsx';
import { Event, Category } from '../types';
import IconComponent from '../components/IconComponent.tsx';

// Types pour les filtres
interface FilterState {
  categories: string[];
  location: string;
  dateRange: string;
  sortBy: string;
}

// Données mockées - à remplacer par appels API
const mockEvents: Event[] = [];

const mockCategories: Category[] = [
  { id: '1', name: 'Concert', slug: 'concert', icon: '🎵', color: '#f97316' },
  { id: '2', name: 'Festival', slug: 'festival', icon: '🎭', color: '#22c55e' },
  { id: '3', name: 'Théâtre', slug: 'theatre', icon: '🎪', color: '#6366f1' },
  { id: '4', name: 'Danse', slug: 'danse', icon: '💃', color: '#ec4899' },
  { id: '5', name: 'Exposition', slug: 'exposition', icon: '🎨', color: '#8b5cf6' },
  { id: '6', name: 'Autre', slug: 'autre', icon: '📅', color: '#6b7280' },
];

const HomePage: React.FC = () => {
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(mockEvents);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    location: '',
    dateRange: '',
    sortBy: 'popularity'
  });

  // Écouter les changements depuis le Header
  useEffect(() => {
    const handleStorageChange = () => {
      const storedFilters = localStorage.getItem('currentFilters');
      if (storedFilters) {
        const newFilters = JSON.parse(storedFilters);
        setFilters(newFilters);
        applyFilters(newFilters);
      }
    };

    // Charger les événements créés depuis localStorage
    const loadCreatedEvents = () => {
      const createdEvents = localStorage.getItem('createdEvents');
      if (createdEvents) {
        const events = JSON.parse(createdEvents);
        // Convertir les événements créés au format Event
        const formattedEvents = events.map((event: any) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          short_description: event.shortDescription,
          category: mockCategories.find(c => c.id === event.categoryId) || mockCategories[0],
          organizer: { 
            id: '1', 
            company_name: 'Organisateur', 
            is_verified: true, 
            rating: 4.8 
          },
          venue: { 
            id: event.venueId || '1', 
            name: 'Lieu de l\'événement', 
            address: 'Adresse', 
            city: { id: '1', name: 'Lomé', slug: 'lome' }
          },
          start_date: event.startDate,
          end_date: event.endDate,
          min_price: event.isFree ? 0 : (event.ticketTypes && event.ticketTypes[0]?.price) || 0,
          max_price: event.isFree ? 0 : (event.ticketTypes && event.ticketTypes[event.ticketTypes.length - 1]?.price) || 0,
          is_free: event.isFree,
          interested_count: Math.floor(Math.random() * 1000),
          views_count: Math.floor(Math.random() * 5000),
          status: 'upcoming',
          image_url: event.coverImage || '',
          tags: ['créé'],
          created_at: event.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        // Combiner avec les événements mockés (actuellement vide)
        const allEvents = [...mockEvents, ...formattedEvents];
        setFilteredEvents(allEvents);
      } else {
        // Si aucun événement créé, utiliser seulement les mockEvents
        setFilteredEvents(mockEvents);
      }
    };

    // Écouter les changements de localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Charger les événements initiaux
    loadCreatedEvents();
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Appliquer les filtres aux événements
  const applyFilters = (currentFilters: FilterState) => {
    // Charger les événements créés depuis localStorage
    const createdEvents = localStorage.getItem('createdEvents');
    let allEvents = [...mockEvents];
    
    if (createdEvents) {
      const events = JSON.parse(createdEvents);
      // Convertir les événements créés au format Event
      const formattedEvents = events.map((event: any) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        short_description: event.shortDescription,
        category: mockCategories.find(c => c.id === event.categoryId) || mockCategories[0],
        organizer: { 
          id: '1', 
          company_name: 'Organisateur', 
          is_verified: true, 
          rating: 4.8 
        },
        venue: event.venue || { // Utiliser le lieu personnalisé ou fallback
          id: event.venueId || 'custom', 
          name: event.venueName || 'Lieu de l\'événement', 
          address: event.venueAddress || 'Adresse', 
          city: { id: '1', name: 'Lomé', slug: 'lome' }
        },
        start_date: event.startDate,
        end_date: event.endDate,
        min_price: event.isFree ? 0 : (event.ticketTypes && event.ticketTypes[0]?.price) || 0,
        max_price: event.isFree ? 0 : (event.ticketTypes && event.ticketTypes[event.ticketTypes.length - 1]?.price) || 0,
        is_free: event.isFree,
        interested_count: Math.floor(Math.random() * 1000),
        views_count: Math.floor(Math.random() * 5000),
        status: 'upcoming',
        image_url: event.coverImage || '',
        tags: ['créé'],
        created_at: event.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      // Combiner avec les événements mockés
      allEvents = [...mockEvents, ...formattedEvents];
    }
    
    let filtered = [...allEvents];

    // Filtrer par catégories
    if (currentFilters.categories.length > 0) {
      filtered = filtered.filter(event => 
        currentFilters.categories.includes(event.category.slug)
      );
    }

    // Filtrer par lieu (recherche textuelle)
    if (currentFilters.location) {
      filtered = filtered.filter(event => 
        event.venue && (
          event.venue.city?.name?.toLowerCase().includes(currentFilters.location.toLowerCase()) ||
          event.venue.name?.toLowerCase().includes(currentFilters.location.toLowerCase()) ||
          event.venue.address?.toLowerCase().includes(currentFilters.location.toLowerCase())
        )
      );
    }

    // Filtrer par date
    if (currentFilters.dateRange) {
      const filterDate = new Date(currentFilters.dateRange);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.start_date);
        return eventDate.toDateString() === filterDate.toDateString();
      });
    }

    // Trier les résultats
    if (currentFilters.sortBy) {
      filtered = filtered.sort((a, b) => {
        switch (currentFilters.sortBy) {
          case 'date':
            return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
          case 'price-asc':
            if (a.is_free && !b.is_free) return -1;
            if (!a.is_free && b.is_free) return 1;
            if (a.is_free && b.is_free) return 0;
            return a.min_price - b.min_price;
          case 'price-desc':
            if (a.is_free && !b.is_free) return 1;
            if (!a.is_free && b.is_free) return -1;
            if (a.is_free && b.is_free) return 0;
            return b.min_price - a.min_price;
          case 'popularity':
          default:
            return b.interested_count - a.interested_count;
        }
      });
    }

    setFilteredEvents(filtered);
  };

  // Filtrer par catégorie (ancien système pour compatibilité)
  useEffect(() => {
    if (selectedCategory) {
      // Charger les événements créés depuis localStorage
      const createdEvents = localStorage.getItem('createdEvents');
      let allEvents = [...mockEvents];
      
      if (createdEvents) {
        const events = JSON.parse(createdEvents);
        // Convertir les événements créés au format Event
        const formattedEvents = events.map((event: any) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          short_description: event.shortDescription,
          category: mockCategories.find(c => c.id === event.categoryId) || mockCategories[0],
          organizer: { 
            id: '1', 
            company_name: 'Organisateur', 
            is_verified: true, 
            rating: 4.8 
          },
          venue: event.venue || { // Utiliser le lieu personnalisé ou fallback
            id: event.venueId || 'custom', 
            name: event.venueName || 'Lieu de l\'événement', 
            address: event.venueAddress || 'Adresse', 
            city: { id: '1', name: 'Lomé', slug: 'lome' }
          },
          start_date: event.startDate,
          end_date: event.endDate,
          min_price: event.isFree ? 0 : (event.ticketTypes && event.ticketTypes[0]?.price) || 0,
          max_price: event.isFree ? 0 : (event.ticketTypes && event.ticketTypes[event.ticketTypes.length - 1]?.price) || 0,
          is_free: event.isFree,
          interested_count: Math.floor(Math.random() * 1000),
          views_count: Math.floor(Math.random() * 5000),
          status: 'upcoming',
          image_url: event.coverImage || '',
          tags: ['créé'],
          created_at: event.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        // Combiner avec les événements mockés
        allEvents = [...mockEvents, ...formattedEvents];
      }
      
      setFilteredEvents(allEvents.filter(event => event.category.slug === selectedCategory));
    } else {
      applyFilters(filters);
    }
  }, [selectedCategory]);

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug === selectedCategory ? '' : categorySlug);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header de la page */}
        <div className="mb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TicketIcon className="w-6 h-6 text-purple-600" />
              Événements à venir
            </h2>
          </div>

          {/* Catégories rapides */}
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => handleCategoryChange('')}
                className={`category-pill whitespace-nowrap ${
                  selectedCategory === '' ? 'active' : ''
                }`}
              >
                <TicketIcon className="w-4 h-4 inline mr-1" />
                Tous les événements
              </button>
              {mockCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={`category-pill whitespace-nowrap ${
                    selectedCategory === category.slug ? 'active' : ''
                  }`}
                >
                  <IconComponent name={category.icon} className="w-4 h-4 inline mr-1" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Liste des événements */}
        <div>
          {/* Résultats */}
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''} trouvé{filteredEvents.length > 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-2">
              <select className="text-sm border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                <option>Trier par: Popularité</option>
                <option>Date</option>
                <option>Prix croissant</option>
                <option>Prix décroissant</option>
              </select>
            </div>
          </div>

          {/* Grille d'événements */}
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <TicketIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Aucun événement trouvé
              </h3>
              <p className="text-gray-500 mb-6">
                Essayez d'ajuster vos filtres pour voir plus de résultats.
              </p>
              <button
                onClick={() => setSelectedCategory('')}
                className="btn-primary"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>

        {/* Call to action pour organisateurs */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
            <TicketIcon className="w-5 h-5 text-purple-600" />
            Vous êtes un organisateur d'événements ?
          </h3>
          <p className="text-gray-600 mb-6">
            Créez et gérez vos événements culturels en toute simplicité
          </p>
          <Link to="/organiser" className="text-purple-600 hover:text-purple-700 font-medium text-sm inline-flex items-center gap-2">
            Créer un événement
            <ChevronRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
