const { getVenuesHandler } = require('../controllers/venueController');

const venueRoutes = async (fastify) => {
  // GET all venues
  fastify.get('/api/venues', getVenuesHandler);
};

module.exports = venueRoutes;
