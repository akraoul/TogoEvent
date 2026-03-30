const { getDatabase } = require('../plugins/db');

const getCategories = async () => {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM categories ORDER BY name ASC');
  const categories = stmt.all();
  
  return {
    success: true,
    data: categories
  };
};

module.exports = {
  getCategories
};
