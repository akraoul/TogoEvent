/**
 * Configuration de sécurité simplifiée
 * TogoEvents Backend
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * Configuration Helmet pour la sécurité
 */
const helmetConfig = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:8000", "https://api.togoevents.tg"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"]
    }
  },

  // Cross-Origin Embedder Policy
  crossOriginEmbedderPolicy: false,

  // Cross-Origin Opener Policy
  crossOriginOpenerPolicy: { policy: "same-origin" },

  // Cross-Origin Resource Policy
  crossOriginResourcePolicy: { policy: "cross-origin" },

  // HSTS
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },

  // Referrer Policy
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },

  // X-Frame-Options
  xFrameOptions: { action: 'deny' }
});

/**
 * Configuration du rate limiting
 */
const createRateLimit = (options = {}) => {
  return rateLimit({
    // Fenêtre de temps (15 minutes par défaut)
    windowMs: options.windowMs || 15 * 60 * 1000,

    // Nombre maximum de requêtes
    max: options.max || 100,

    // Message d'erreur
    message: {
      error: 'Too Many Requests',
      message: 'Trop de requêtes envoyées, veuillez réessayer plus tard',
      retryAfter: Math.ceil(options.windowMs / 1000)
    },

    // Ne pas rate limiter en développement
    skip: (req) => {
      return process.env.NODE_ENV === 'development' || 
             req.ip === '127.0.0.1' || 
             req.ip === '::1';
    },

    // Headers de rate limiting
    standardHeaders: true,
    legacyHeaders: false,

    // Gestion des tentatives
    keyGenerator: (req) => {
      return req.ip;
    },

    // Handler personnalisé
    handler: (req, res) => {
      console.warn(`⚠️ Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Trop de requêtes envoyées, veuillez réessayer plus tard',
        retryAfter: Math.ceil(options.windowMs / 1000)
      });
    },

    ...options
  });
};

/**
 * Rate limiting pour l'API générale
 */
const apiRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requêtes par 15 minutes
  message: {
    error: 'API Rate Limit Exceeded',
    message: 'Limite de requêtes API dépassée'
  }
});

/**
 * Rate limiting strict pour la création d'événements
 */
const createEventRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 événements par heure
  message: {
    error: 'Event Creation Rate Limit Exceeded',
    message: 'Limite de création d\'événements dépassée (10 par heure)'
  }
});

/**
 * Rate limiting pour l'authentification
 */
const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par 15 minutes
  message: {
    error: 'Auth Rate Limit Exceeded',
    message: 'Trop de tentatives de connexion, veuillez réessayer plus tard'
  }
});

/**
 * Validation des entrées
 */
const sanitizeInput = (req, res, next) => {
  // Nettoyer les paramètres de requête
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key].trim();
      }
    });
  }

  // Nettoyer le corps de la requête
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }

  next();
};

/**
 * Validation des tailles de payload
 */
const validatePayloadSize = (maxSize = 10 * 1024 * 1024) => { // 10MB par défaut
  return (req, res, next) => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      return res.status(413).json({
        error: 'Payload Too Large',
        message: 'La taille des données dépasse la limite autorisée',
        maxSize: maxSize
      });
    }

    next();
  };
};

/**
 * Middleware de sécurité complet
 */
const securityMiddleware = [
  helmetConfig,
  apiRateLimit,
  sanitizeInput,
  validatePayloadSize()
];

/**
 * Configuration pour les routes spécifiques
 */
const routeSecurity = {
  // Routes de création d'événements
  createEvent: [createEventRateLimit, validatePayloadSize(5 * 1024 * 1024)], // 5MB
  
  // Routes d'authentification
  auth: [authRateLimit],
  
  // Routes générales
  general: [apiRateLimit]
};

module.exports = {
  helmetConfig,
  createRateLimit,
  apiRateLimit,
  createEventRateLimit,
  authRateLimit,
  sanitizeInput,
  validatePayloadSize,
  securityMiddleware,
  routeSecurity
};
