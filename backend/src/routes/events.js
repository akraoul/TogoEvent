const { getEventsHandler, createEventHandler } = require('../controllers/eventController');

const eventRoutes = async (fastify) => {
  // GET all events
  fastify.get('/api/events', getEventsHandler);
  
  // POST create event
  fastify.post('/api/events', createEventHandler);
};

module.exports = eventRoutes;
