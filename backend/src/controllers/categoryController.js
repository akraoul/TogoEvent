const { getCategories } = require('../services/categoryService');

const getCategoriesHandler = async (request, reply) => {
  try {
    const result = await getCategories();
    return result;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      error: 'Failed to fetch categories',
      message: error.message
    };
  }
};

module.exports = {
  getCategoriesHandler
};
