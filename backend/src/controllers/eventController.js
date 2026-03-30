const { getEvents, createEvent } = require('../services/eventService');

const getEventsHandler = async (request, reply) => {
  try {
    const result = await getEvents();
    return result;
  } catch (error) {
    console.error('Error fetching events:', error);
    reply.code(500);
    return {
      success: false,
      error: 'Failed to fetch events',
      message: error.message
    };
  }
};

const createEventHandler = async (request, reply) => {
  try {
    const result = await createEvent(request.body);
    
    if (!result.success) {
      reply.code(400);
    }
    
    return result;
  } catch (error) {
    console.error('Error creating event:', error);
    reply.code(500);
    return {
      success: false,
      error: 'Failed to create event',
      message: error.message
    };
  }
};

module.exports = {
  getEventsHandler,
  createEventHandler
};
