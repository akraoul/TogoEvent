const { getCities } = require('../services/cityService');

const getCitiesHandler = async (request, reply) => {
  try {
    const result = await getCities();
    return result;
  } catch (error) {
    console.error('Error fetching cities:', error);
    return {
      success: false,
      error: 'Failed to fetch cities',
      message: error.message
    };
  }
};

module.exports = {
  getCitiesHandler
};
