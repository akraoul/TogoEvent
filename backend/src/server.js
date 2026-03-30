/**
 * TogoEvents Backend API Server - Architecture modulaire
 */
const fastify = require('fastify')({ logger: true });
require('dotenv').config();

// Import plugins
const { initializeDatabase } = require('./plugins/db');

// Import routes
const eventRoutes = require('./routes/events');
const categoryRoutes = require('./routes/categories');
const healthRoutes = require('./routes/health');
const cityRoutes = require('./routes/cities');
const venueRoutes = require('./routes/venues');

// ====================== INITIALISATION ======================
initializeDatabase();

// ====================== CORS ======================
fastify.register(require('@fastify/cors'), {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://togoevent-frontend.vercel.app',
    'https://togoevent-backend.vercel.app',
    'https://togoevents.vercel.app',
    'https://www.togoevents.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
});

// ====================== ROUTES ======================
const registerRoutes = async () => {
  await eventRoutes(fastify);
  await categoryRoutes(fastify);
  await healthRoutes(fastify);
  await cityRoutes(fastify);
  await venueRoutes(fastify);
  
  console.log('✅ Routes enregistrées');
};

// ====================== START FUNCTION ======================
const start = async () => {
  try {
    // Enregistrer les routes
    await registerRoutes();
    
    const port = process.env.PORT || 8001;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Serveur démarré sur le port ${port}`);
  } catch (err) {
    console.error('Erreur au démarrage:', err);
    process.exit(1);
  }
};

// ====================== EXPORT POUR VERCEL ======================
module.exports = fastify;

// Démarrer seulement si pas sur Vercel
if (require.main === module) {
  start();
}
