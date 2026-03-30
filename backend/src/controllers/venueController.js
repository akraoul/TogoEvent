const { getVenues } = require('../services/venueService');

const getVenuesHandler = async (request, reply) => {
  try {
    const result = await getVenues();
    return result;
  } catch (error) {
    console.error('Error fetching venues:', error);
    return {
      success: false,
      error: 'Failed to fetch venues',
      message: error.message
    };
  }
};

module.exports = {
  getVenuesHandler
};
