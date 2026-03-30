const { getHealthHandler } = require('../controllers/healthController');

const healthRoutes = async (fastify) => {
  // GET health check
  fastify.get('/api/health', getHealthHandler);
};

module.exports = healthRoutes;
