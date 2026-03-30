const { getCategoriesHandler } = require('../controllers/categoryController');

const categoryRoutes = async (fastify) => {
  // GET all categories
  fastify.get('/api/categories', getCategoriesHandler);
};

module.exports = categoryRoutes;
