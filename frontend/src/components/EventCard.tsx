import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  MapPinIcon, 
  CalendarIcon, 
  ClockIcon,
  UserIcon,
  TagIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { Event } from '../types';
import IconComponent from './IconComponent.tsx';

interface EventCardProps {
  event: Event;
  showOrganizer?: boolean;
  compact?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  showOrganizer = true, 
  compact = false 
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEE d MMM yyyy | HH\'h\'mm', { locale: fr });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TG', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getEventStatusBadge = () => {
    if (event.is_sold_out) {
      return <span className="event-badge event-badge-soldout">Complet</span>;
    }
    if (event.is_promo) {
      return <span className="event-badge event-badge-promo">Promotion</span>;
    }
    if (event.is_early_bird) {
      return <span className="event-badge event-badge-early">Early bird</span>;
    }
    return null;
  };

  const getInterestedCount = () => {
    if (event.interested_count) {
      return `${event.interested_count} intéressés`;
    }
    if (event.sold_tickets && event.total_capacity) {
      return `${event.sold_tickets} billets vendus`;
    }
    return '';
  };

  return (
    <div className={`event-card ${compact ? 'flex gap-4' : ''}`}>
      {/* Image */}
      <div className={`${compact ? 'w-32 h-24 flex-shrink-0' : 'relative'}`}>
        <img
          src={event.cover_image || `https://via.placeholder.com/400x300/f97316/FFFFFF?text=${encodeURIComponent(event.title)}`}
          alt={event.title}
          className={`event-card-image ${compact ? 'rounded-lg' : 'rounded-t-lg'}`}
          loading="lazy"
        />
        
        {/* Badge promotionnel */}
        {!compact && getEventStatusBadge() && (
          <div className="absolute top-2 left-2">
            {getEventStatusBadge()}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className={`event-card-content ${compact ? 'flex-1 py-2' : ''}`}>
        {/* Catégorie */}
        <div className="flex items-center gap-2 mb-2">
          <IconComponent name={event.category.icon} className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">
            {event.category.name}
          </span>
          {compact && getEventStatusBadge()}
        </div>

        {/* Titre */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          <Link 
            to={`/event/${event.id}`}
            className="text-gray-900 hover:text-togo-orange transition-colors"
          >
            {event.title}
          </Link>
        </h3>

        {/* Compteur d'intéressés/billets vendus */}
        {getInterestedCount() && (
          <div className="ticket-counter mb-2">
            <FireIcon className="w-4 h-4 text-togo-orange inline mr-1" />
            <strong>{getInterestedCount()}</strong>
          </div>
        )}

        {/* Métadonnées */}
        <div className="space-y-1 mb-3">
          {/* Date et heure */}
          <div className="event-meta">
            <CalendarIcon className="event-meta-icon" />
            <span>{formatDate(event.start_date)}</span>
          </div>

          {/* Lieu */}
          <div className="event-meta">
            <MapPinIcon className="event-meta-icon" />
            <span>{event.venue.name}, {event.venue.city.name}</span>
          </div>
        </div>

        {/* Prix */}
        <div className="price-display mb-3">
          {event.is_free ? (
            <span>Gratuit</span>
          ) : (
            <span>
              <span className="price-prefix">À partir de</span>{' '}
              {formatPrice(event.min_price)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3">
          {/* Bouton principal */}
          <Link 
            to={`/event/${event.id}`}
            className="btn-primary flex-1 text-center"
          >
            {event.is_sold_out ? 'Voir les détails' : 'Acheter tickets'}
          </Link>

          {/* Bouton s'abonner */}
          {showOrganizer && (
            <button className="btn-subscribe">
              S'abonner
            </button>
          )}
        </div>

        {/* Organisateur (optionnel) */}
        {showOrganizer && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <Link 
                  to={`/organizer/${event.organizer.id}`}
                  className="text-sm text-gray-600 hover:text-togo-orange transition-colors"
                >
                  {event.organizer.company_name}
                </Link>
                {event.organizer.is_verified && (
                  <span className="text-xs bg-togo-green text-white px-2 py-1 rounded-full">
                    ✓
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
