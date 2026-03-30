/**
 * Constantes de l'application
 * TogoEvents Backend
 */

// Configuration de l'application
const APP_CONFIG = {
  NAME: 'TogoEvents',
  VERSION: '1.0.0',
  DESCRIPTION: 'N°1 de la billetterie événementielle culturelle au Togo',
  AUTHOR: 'TogoEvents Team',
  LICENSE: 'MIT',
  WEBSITE: 'https://togoevents.tg',
  SUPPORT_EMAIL: 'support@togoevents.tg'
};

// Codes HTTP
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

// Statuts des événements
const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  POSTPONED: 'postponed',
  COMPLETED: 'completed'
};

// Types d'événements
const EVENT_TYPES = {
  CONCERT: 'concert',
  FESTIVAL: 'festival',
  THEATRE: 'theatre',
  DANCE: 'danse',
  EXHIBITION: 'exposition',
  CONFERENCE: 'conference',
  WORKSHOP: 'workshop',
  SPORT: 'sport',
  OTHER: 'other'
};

// Catégories prédéfinies
const DEFAULT_CATEGORIES = [
  {
    id: '1',
    name: 'Concert',
    slug: 'concert',
    icon: '🎵',
    color: '#f97316',
    order_index: 1
  },
  {
    id: '2',
    name: 'Festival',
    slug: 'festival',
    icon: '🎭',
    color: '#22c55e',
    order_index: 2
  },
  {
    id: '3',
    name: 'Théâtre',
    slug: 'theatre',
    icon: '🎪',
    color: '#6366f1',
    order_index: 3
  },
  {
    id: '4',
    name: 'Danse',
    slug: 'danse',
    icon: '💃',
    color: '#ec4899',
    order_index: 4
  },
  {
    id: '5',
    name: 'Exposition',
    slug: 'exposition',
    icon: '🎨',
    color: '#8b5cf6',
    order_index: 5
  },
  {
    id: '6',
    name: 'Autre',
    slug: 'autre',
    icon: '📅',
    color: '#6b7280',
    order_index: 6
  }
];

// Villes du Togo
const DEFAULT_CITIES = [
  {
    id: '1',
    name: 'Lomé',
    slug: 'lome',
    country: 'TG',
    region: 'Maritime'
  },
  {
    id: '2',
    name: 'Kara',
    slug: 'kara',
    country: 'TG',
    region: 'Kara'
  },
  {
    id: '3',
    name: 'Sokodé',
    slug: 'sokode',
    country: 'TG',
    region: 'Centrale'
  },
  {
    id: '4',
    name: 'Atakpamé',
    slug: 'atakpame',
    country: 'TG',
    region: 'Plateaux'
  },
  {
    id: '5',
    name: 'Kpalimé',
    slug: 'kpalime',
    country: 'TG',
    region: 'Plateaux'
  },
  {
    id: '6',
    name: 'Mango',
    slug: 'mango',
    country: 'TG',
    region: 'Savanes'
  },
  {
    id: '7',
    name: 'Dapaong',
    slug: 'dapaong',
    country: 'TG',
    region: 'Savanes'
  },
  {
    id: '8',
    name: 'Tsévié',
    slug: 'tsevie',
    country: 'TG',
    region: 'Maritime'
  },
  {
    id: '9',
    name: 'Aného',
    slug: 'aneho',
    country: 'TG',
    region: 'Maritime'
  },
  {
    id: '10',
    name: 'Bassar',
    slug: 'bassar',
    country: 'TG',
    region: 'Centrale'
  }
];

// Lieux prédéfinis
const DEFAULT_VENUES = [
  {
    id: '1',
    name: 'Palais des Congrès',
    address: 'Place de l\'Indépendance, Lomé',
    city_id: '1',
    capacity: 2000,
    type: 'convention_center'
  },
  {
    id: '2',
    name: 'Stade de Kégué',
    address: 'Route de Kégué, Lomé',
    city_id: '1',
    capacity: 30000,
    type: 'stadium'
  },
  {
    id: '3',
    name: 'Centre Culturel Français',
    address: 'Boulevard du Mono, Lomé',
    city_id: '1',
    capacity: 500,
    type: 'cultural_center'
  },
  {
    id: '4',
    name: 'Kara Events Center',
    address: 'Place du Marché, Kara',
    city_id: '2',
    capacity: 1000,
    type: 'events_center'
  },
  {
    id: '5',
    name: 'Sokodé Cultural Hall',
    address: 'Avenue du 24 Janvier, Sokodé',
    city_id: '3',
    capacity: 800,
    type: 'cultural_center'
  }
];

// Types de billets prédéfinis
const DEFAULT_TICKET_TYPES = [
  {
    name: 'Standard',
    description: 'Billets standard',
    price: 5000,
    currency: 'XOF'
  },
  {
    name: 'VIP',
    description: 'Billets VIP avec avantages',
    price: 15000,
    currency: 'XOF'
  },
  {
    name: 'Premium',
    description: 'Billets premium avec services exclusifs',
    price: 25000,
    currency: 'XOF'
  },
  {
    name: 'Étudiant',
    description: 'Tarif réduit pour étudiants',
    price: 2500,
    currency: 'XOF'
  },
  {
    name: 'Enfant',
    description: 'Tarif enfant (-12 ans)',
    price: 2000,
    currency: 'XOF'
  }
];

// Monnaies supportées
const CURRENCIES = {
  XOF: {
    name: 'Franc CFA BCEAO',
    symbol: 'F CFA',
    code: 'XOF',
    country: 'TG'
  },
  EUR: {
    name: 'Euro',
    symbol: '€',
    code: 'EUR',
    country: 'FR'
  },
  USD: {
    name: 'Dollar américain',
    symbol: '$',
    code: 'USD',
    country: 'US'
  }
};

// Limites et contraintes
const LIMITS = {
  EVENT_TITLE: { min: 3, max: 200 },
  EVENT_DESCRIPTION: { min: 0, max: 5000 },
  EVENT_SHORT_DESCRIPTION: { min: 0, max: 500 },
  VENUE_NAME: { min: 3, max: 200 },
  VENUE_ADDRESS: { min: 5, max: 500 },
  CATEGORY_NAME: { min: 2, max: 100 },
  CITY_NAME: { min: 2, max: 100 },
  USER_NAME: { min: 2, max: 100 },
  USER_EMAIL: { min: 5, max: 255 },
  PASSWORD: { min: 8, max: 128 },
  TICKET_NAME: { min: 1, max: 100 },
  TICKET_DESCRIPTION: { min: 0, max: 500 },
  PAGINATION: { min: 1, max: 100, default: 20 },
  SEARCH_QUERY: { min: 1, max: 100 },
  UPLOAD_SIZE: { max: 10 * 1024 * 1024 }, // 10MB
  RATE_LIMIT: {
    GENERAL: { windowMs: 15 * 60 * 1000, max: 1000 }, // 15min, 1000 req
    CREATE_EVENT: { windowMs: 60 * 60 * 1000, max: 10 }, // 1h, 10 events
    AUTH: { windowMs: 15 * 60 * 1000, max: 5 } // 15min, 5 attempts
  }
};

// Messages d'erreur
const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED: 'Ce champ est requis',
    INVALID_EMAIL: 'Email invalide',
    INVALID_PHONE: 'Numéro de téléphone invalide',
    INVALID_DATE: 'Date invalide',
    PASSWORD_TOO_WEAK: 'Le mot de passe est trop faible',
    INVALID_UUID: 'ID invalide',
    INVALID_STATUS: 'Statut invalide'
  },
  AUTH: {
    UNAUTHORIZED: 'Non autorisé',
    FORBIDDEN: 'Accès refusé',
    TOKEN_EXPIRED: 'Token expiré',
    INVALID_CREDENTIALS: 'Identifiants invalides',
    ACCOUNT_LOCKED: 'Compte verrouillé'
  },
  RESOURCE: {
    NOT_FOUND: 'Ressource non trouvée',
    ALREADY_EXISTS: 'Ressource déjà existante',
    CONFLICT: 'Conflit de données',
    CANNOT_DELETE: 'Impossible de supprimer cette ressource'
  },
  SERVER: {
    INTERNAL_ERROR: 'Erreur interne du serveur',
    DATABASE_ERROR: 'Erreur de base de données',
    EXTERNAL_SERVICE_ERROR: 'Erreur de service externe',
    RATE_LIMIT_EXCEEDED: 'Limite de requêtes dépassée'
  }
};

// Messages de succès
const SUCCESS_MESSAGES = {
  CREATED: 'Créé avec succès',
  UPDATED: 'Mis à jour avec succès',
  DELETED: 'Supprimé avec succès',
  AUTH_SUCCESS: 'Authentification réussie',
  LOGOUT_SUCCESS: 'Déconnexion réussie',
  EMAIL_SENT: 'Email envoyé avec succès',
  PAYMENT_SUCCESS: 'Paiement effectué avec succès'
};

// Templates d'emails
const EMAIL_TEMPLATES = {
  WELCOME: {
    subject: 'Bienvenue sur TogoEvents',
    template: 'welcome'
  },
  EVENT_CONFIRMATION: {
    subject: 'Confirmation de création d\'événement',
    template: 'event_confirmation'
  },
  TICKET_CONFIRMATION: {
    subject: 'Confirmation d\'achat de billets',
    template: 'ticket_confirmation'
  },
  PASSWORD_RESET: {
    subject: 'Réinitialisation du mot de passe',
    template: 'password_reset'
  },
  EVENT_REMINDER: {
    subject: 'Rappel d\'événement',
    template: 'event_reminder'
  }
};

// Configuration des fichiers
const FILE_CONFIG = {
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  UPLOAD_PATH: './uploads',
  IMAGE_QUALITY: 80,
  THUMBNAIL_SIZE: { width: 300, height: 200 }
};

// Configuration du cache
const CACHE_CONFIG = {
  TTL: {
    SHORT: 5 * 60, // 5 minutes
    MEDIUM: 30 * 60, // 30 minutes
    LONG: 2 * 60 * 60, // 2 heures
    DAY: 24 * 60 * 60 // 24 heures
  },
  KEYS: {
    EVENTS: 'events:',
    CATEGORIES: 'categories',
    VENUES: 'venues:',
    CITIES: 'cities',
    USER: 'user:',
    STATS: 'stats:'
  }
};

// Configuration des webhooks
const WEBHOOK_EVENTS = {
  EVENT_CREATED: 'event.created',
  EVENT_UPDATED: 'event.updated',
  EVENT_CANCELLED: 'event.cancelled',
  TICKET_PURCHASED: 'ticket.purchased',
  USER_REGISTERED: 'user.registered',
  PAYMENT_COMPLETED: 'payment.completed'
};

// Configuration des logs
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

// Configuration de l'API
const API_CONFIG = {
  VERSION: 'v1',
  PREFIX: '/api',
  RATE_LIMIT: true,
  CORS_ENABLED: true,
  HELMET_ENABLED: true,
  COMPRESSION_ENABLED: true,
  REQUEST_TIMEOUT: 30000, // 30 secondes
  RESPONSE_TIMEOUT: 60000 // 60 secondes
};

// Configuration de la base de données
const DB_CONFIG = {
  SQLITE: {
    PATH: './togoevents.db',
    BACKUP_PATH: './backups/',
    BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 heures
    MAX_CONNECTIONS: 10
  }
};

// Regex patterns
const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_TOGO: /^(\+228|00228)?[2359]\d{7}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  SLUG: /^[a-z0-9-]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/
};

// Codes de pays
const COUNTRY_CODES = {
  TG: 'Togo',
  BF: 'Burkina Faso',
  BJ: 'Bénin',
  CI: 'Côte d\'Ivoire',
  GH: 'Ghana',
  NE: 'Niger',
  NG: 'Nigeria',
  SN: 'Sénégal',
  ML: 'Mali',
  FR: 'France',
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom'
};

module.exports = {
  APP_CONFIG,
  HTTP_STATUS,
  EVENT_STATUS,
  EVENT_TYPES,
  DEFAULT_CATEGORIES,
  DEFAULT_CITIES,
  DEFAULT_VENUES,
  DEFAULT_TICKET_TYPES,
  CURRENCIES,
  LIMITS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  EMAIL_TEMPLATES,
  FILE_CONFIG,
  CACHE_CONFIG,
  WEBHOOK_EVENTS,
  LOG_LEVELS,
  API_CONFIG,
  DB_CONFIG,
  REGEX_PATTERNS,
  COUNTRY_CODES
};
