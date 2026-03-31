// API Configuration
export const API_CONFIG = {
  // Base URL
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8001',
  
  // Endpoints
  ENDPOINTS: {
    EVENTS: '/api/events',
    CATEGORIES: '/api/categories',
    CITIES: '/api/cities',
    VENUES: '/api/venues',
    HEALTH: '/api/health',
  },
  
  // Request config
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Helper methods
  getUrl: (endpoint: string) => `${API_CONFIG.BASE_URL}${endpoint}`,
  
  // Build query string
  buildQuery: (params: Record<string, any>) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    return searchParams.toString();
  },
};

// App Constants
export const APP_CONFIG = {
  NAME: 'TogoEvents',
  VERSION: '1.0.0',
  DESCRIPTION: 'Plateforme N°1 de la billetterie événementielle culturelle au Togo',
  
  // Local Storage Keys
  STORAGE_KEYS: {
    USER: 'togoevents-user',
    TOKEN: 'togoevents-token',
    CART: 'togoevents-cart',
    PREFERENCES: 'togoevents-preferences',
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 12,
    MAX_PAGE_SIZE: 50,
  },
  
  // Currency
  CURRENCY: {
    CODE: 'XOF',
    SYMBOL: 'FCFA',
    LOCALE: 'fr-FR',
  },
  
  // Date formats
  DATE_FORMATS: {
    DISPLAY: 'dd MMMM yyyy à HH:mm',
    SHORT: 'dd MMM yyyy',
    INPUT: 'yyyy-MM-dd\'T\'HH:mm',
  },
};
