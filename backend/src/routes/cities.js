const { getCitiesHandler } = require('../controllers/cityController');

const cityRoutes = async (fastify) => {
  // GET all cities
  fastify.get('/api/cities', getCitiesHandler);
};

module.exports = cityRoutes;
