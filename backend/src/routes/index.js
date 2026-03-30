/**
 * Routes Principales
 * TogoEvents Backend
 */

const express = require('express');
const cors = require('../config/cors');
const { securityMiddleware } = require('../config/security');

// Import des routes
const eventRoutes = require('./events');
const categoryRoutes = require('./categories');
const venueRoutes = require('./venues');
const cityRoutes = require('./cities');

const router = express.Router();

/**
 * Middleware de sécurité appliqué à toutes les routes
 */
router.use(securityMiddleware);

/**
 * Middleware CORS
 */
router.use(cors.dynamicCors());

/**
 * Route de health check
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'TogoEvents API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    available_routes: [
      'GET /api/health',
      'GET /api/events',
      'POST /api/events',
      'GET /api/events/:id',
      'GET /api/events/slug/:slug',
      'PUT /api/events/:id',
      'DELETE /api/events/:id',
      'POST /api/events/:id/interested',
      'GET /api/events/search',
      'GET /api/categories',
      'GET /api/venues',
      'GET /api/cities'
    ]
  });
});

/**
 * Routes API
 */
router.use('/events', eventRoutes);
router.use('/categories', categoryRoutes);
router.use('/venues', venueRoutes);
router.use('/cities', cityRoutes);

/**
 * Route d'information sur l'API
 */
router.get('/', (req, res) => {
  res.json({
    name: 'TogoEvents API',
    version: '1.0.0',
    description: 'N°1 de la billetterie événementielle culturelle au Togo',
    endpoints: {
      health: '/api/health',
      events: {
        list: 'GET /api/events',
        create: 'POST /api/events',
        get: 'GET /api/events/:id',
        getBySlug: 'GET /api/events/slug/:slug',
        update: 'PUT /api/events/:id',
        delete: 'DELETE /api/events/:id',
        interested: 'POST /api/events/:id/interested',
        search: 'GET /api/events/search'
      },
      categories: {
        list: 'GET /api/categories'
      },
      venues: {
        list: 'GET /api/venues'
      },
      cities: {
        list: 'GET /api/cities'
      }
    },
    documentation: {
      swagger: '/api/docs',
      postman: 'https://documenter.getpostman.com/view/togoevents/api'
    },
    support: {
      email: 'support@togoevents.tg',
      website: 'https://togoevents.tg',
      github: 'https://github.com/togoevents/api'
    }
  });
});

/**
 * Middleware pour les routes non trouvées
 */
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} non trouvée`,
    available_routes: [
      'GET /api/health',
      'GET /api/events',
      'POST /api/events',
      'GET /api/events/:id',
      'GET /api/events/slug/:slug',
      'PUT /api/events/:id',
      'DELETE /api/events/:id',
      'POST /api/events/:id/interested',
      'GET /api/events/search',
      'GET /api/categories',
      'GET /api/venues',
      'GET /api/cities'
    ],
    documentation: '/api'
  });
});

module.exports = router;
