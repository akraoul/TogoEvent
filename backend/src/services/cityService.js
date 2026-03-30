const { getDatabase } = require('../plugins/db');

const getCities = async () => {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM cities ORDER BY name ASC');
  const cities = stmt.all();
  
  return {
    success: true,
    data: cities
  };
};

module.exports = {
  getCities
};
