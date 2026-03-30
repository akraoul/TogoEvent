/**
 * Configuration CORS
 * TogoEvents Backend
 */

const cors = require('cors');

/**
 * Configuration CORS pour TogoEvents
 */
const corsOptions = {
  // Origines autorisées
  origin: [
    'http://localhost:3000',      // Frontend en développement
    'http://127.0.0.1:3000',      // Frontend en développement (alternative)
    'http://localhost:5173',      // Vite dev server
    'http://127.0.0.1:5173',      // Vite dev server (alternative)
    process.env.FRONTEND_URL      // URL de production
  ].filter(Boolean), // Filtre les valeurs undefined

  // Méthodes HTTP autorisées
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

  // En-têtes autorisées
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],

  // Exposer les en-têtes au frontend
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page'
  ],

  // Autoriser les cookies/credentials
  credentials: true,

  // Pré-flight cache duration (en secondes)
  maxAge: 86400, // 24 heures

  // Gestion des erreurs CORS
  preflightContinue: false,
  optionsSuccessStatus: 204
};

/**
 * Middleware CORS personnalisé avec logging
 */
const corsMiddleware = (req, res, next) => {
  // Logging des requêtes CORS
  if (req.method === 'OPTIONS') {
    console.log(`🌐 CORS preflight request from: ${req.headers.origin || 'unknown'}`);
  }

  // Application de la configuration CORS
  cors(corsOptions)(req, res, (err) => {
    if (err) {
      console.error('❌ CORS Error:', err);
      return res.status(500).json({
        error: 'CORS Error',
        message: 'Cross-origin request blocked'
      });
    }
    next();
  });
};

/**
 * Validation d'origine personnalisée
 */
const validateOrigin = (origin, callback) => {
  // Autoriser les requêtes sans origine (ex: Postman, curl)
  if (!origin) {
    return callback(null, true);
  }

  // En développement, autoriser localhost
  if (process.env.NODE_ENV === 'development') {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
  }

  // Vérifier les origines autorisées
  const allowedOrigins = corsOptions.origin;
  if (allowedOrigins.includes(origin)) {
    return callback(null, true);
  }

  // Refuser les autres origines
  console.warn(`⚠️ Origin non autorisée: ${origin}`);
  callback(new Error('Not allowed by CORS'));
};

/**
 * Configuration CORS pour développement
 */
const developmentCorsOptions = {
  ...corsOptions,
  origin: true, // Autoriser toutes les origines en développement
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: '*'
};

/**
 * Configuration CORS pour production
 */
const productionCorsOptions = {
  ...corsOptions,
  origin: validateOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  maxAge: 7200 // 2 heures en production
};

/**
 * Sélectionner la configuration CORS selon l'environnement
 */
const getCorsConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    return productionCorsOptions;
  } else {
    return developmentCorsOptions;
  }
};

/**
 * Middleware CORS avec configuration dynamique
 */
const dynamicCors = () => {
  const config = getCorsConfig();
  return cors(config);
};

module.exports = {
  corsOptions,
  corsMiddleware,
  developmentCorsOptions,
  productionCorsOptions,
  getCorsConfig,
  dynamicCors,
  validateOrigin
};
