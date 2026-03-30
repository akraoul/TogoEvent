import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon,
  ChartBarIcon,
  TicketIcon,
  UsersIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  QrCodeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  image: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  totalTickets: number;
  soldTickets: number;
  revenue: number;
  views: number;
}

interface Stat {
  label: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  color: string;
}

const OrganizerDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'analytics'>('overview');
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);

  // Données mockées - tous les événements supprimés
  const mockEvents: Event[] = [];

  // Données mockées - statistiques remises à zéro
  const mockStats: Stat[] = [
    {
      label: 'Revenus total',
      value: '0 FCFA',
      change: 0,
      icon: CurrencyDollarIcon,
      color: 'green'
    },
    {
      label: 'Événements créés',
      value: '0',
      change: 0,
      icon: TicketIcon,
      color: 'blue'
    },
    {
      label: 'Billets vendus',
      value: '0',
      change: 0,
      icon: UsersIcon,
      color: 'purple'
    },
    {
      label: 'Vues totales',
      value: '0',
      change: 0,
      icon: EyeIcon,
      color: 'orange'
    }
  ];

  useEffect(() => {
    // Nettoyer tous les événements du localStorage
    localStorage.removeItem('createdEvents');
    localStorage.removeItem('currentFilters');
    
    setEvents(mockEvents);
    setStats(mockStats);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-TG', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publié';
      case 'draft':
        return 'Brouillon';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const getOccupancyRate = (sold: number, total: number) => {
    return total > 0 ? Math.round((sold / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Organisateur</h1>
              <p className="text-gray-600">Gérez vos événements et suivez vos performances</p>
            </div>
            <Link to="/create-event" className="btn-primary">
              <PlusIcon className="w-5 h-5 inline mr-2" />
              Créer un événement
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Onglets */}
          <div className="bg-white rounded-xl shadow-lg p-1 mb-8">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ChartBarIcon className="w-5 h-5" />
                  Aperçu
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('events')}
                className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'events'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Événements
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'analytics'
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ArrowTrendingUpIcon className="w-5 h-5" />
                  Analytics
                </div>
              </button>
            </div>
          </div>

          {/* Contenu des onglets */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${
                        stat.change > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change > 0 ? (
                          <ArrowTrendingUpIcon className="w-4 h-4" />
                        ) : (
                          <ArrowTrendingDownIcon className="w-4 h-4" />
                        )}
                        <span>{Math.abs(stat.change)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Événements récents */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Événements récents</h2>
                  <button
                    onClick={() => setActiveTab('events')}
                    className="text-orange-500 hover:text-orange-600 font-medium"
                  >
                    Voir tout
                  </button>
                </div>
                
                <div className="space-y-4">
                  {events.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {event.title}
                            </h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>{event.date} • {event.venue}</div>
                              <div className="flex items-center gap-4">
                                <span>{event.soldTickets}/{event.totalTickets} billets</span>
                                <span>{formatPrice(event.revenue)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {getStatusText(event.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions rapides */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <QrCodeIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Scanner QR Code</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Scannez les billets à l'entrée
                  </p>
                  <button className="btn-primary w-full">Scanner</button>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <UsersIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Gérer les abonnés</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    2,847 abonnés actifs
                  </p>
                  <button className="btn-secondary w-full">Voir</button>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <ChartBarIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">Rapports détaillés</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Exportez vos données
                  </p>
                  <button className="btn-secondary w-full">Exporter</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Tous les événements ({events.length})</h2>
                <div className="flex gap-3">
                  <select className="input-field w-48">
                    <option value="">Tous les statuts</option>
                    <option value="published">Publié</option>
                    <option value="draft">Brouillon</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                  <Link to="/create-event" className="btn-primary">
                    <PlusIcon className="w-5 h-5 inline mr-2" />
                    Nouveau
                  </Link>
                </div>
              </div>
              
              {events.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Aucun événement
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Vous n'avez pas encore créé d'événements.
                  </p>
                  <Link to="/create-event" className="btn-primary">
                    Créer votre premier événement
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Événement</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Statut</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Billets</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Revenus</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Vues</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
                        <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={event.image}
                                alt={event.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {event.title}
                                </h4>
                                <p className="text-sm text-gray-600">{event.venue}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {event.date}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {getStatusText(event.status)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              <div className="font-medium">{event.soldTickets}/{event.totalTickets}</div>
                              <div className="text-gray-600">{getOccupancyRate(event.soldTickets, event.totalTickets)}%</div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            {formatPrice(event.revenue)}
                          </td>
                          <td className="py-4 px-4 text-sm text-gray-600">
                            {event.views.toLocaleString()}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-gray-600 hover:text-orange-500 transition-colors">
                                <EyeIcon className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-600 hover:text-orange-500 transition-colors">
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Graphique des revenus */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-6">Revenus sur 6 mois</h2>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <ChartBarIcon className="w-12 h-12 mx-auto mb-2" />
                    <p>Graphique des revenus</p>
                    <p className="text-sm">Intégration avec Chart.js prévue</p>
                  </div>
                </div>
              </div>

              {/* Statistiques détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Performance par événement</h3>
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                          <p className="text-xs text-gray-600">{getOccupancyRate(event.soldTickets, event.totalTickets)}% rempli</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600">{formatPrice(event.revenue)}</p>
                          <p className="text-xs text-gray-600">{event.soldTickets} billets</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold mb-4">Démographie des acheteurs</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">18-25 ans</span>
                        <span className="text-sm font-medium">35%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '35%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">26-35 ans</span>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '45%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">36-45 ans</span>
                        <span className="text-sm font-medium">15%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '15%'}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">46+ ans</span>
                        <span className="text-sm font-medium">5%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{width: '5%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboardPage;
