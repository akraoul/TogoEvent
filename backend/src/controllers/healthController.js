const { getHealth } = require('../services/healthService');

const getHealthHandler = async (request, reply) => {
  try {
    const result = await getHealth();
    
    if (result.status === 'ERROR') {
      reply.code(503);
    }
    
    return result;
  } catch (error) {
    console.error('Health check error:', error);
    reply.code(500);
    return {
      status: 'ERROR',
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
};

module.exports = {
  getHealthHandler
};
