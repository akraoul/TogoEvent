const { getDatabase } = require('../plugins/db');

const getVenues = async () => {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT v.*, c.name as city_name, c.slug as city_slug
    FROM venues v
    LEFT JOIN cities c ON v.city_id = c.id
    ORDER BY v.name ASC
  `);
  const venues = stmt.all();
  
  return {
    success: true,
    data: venues
  };
};

module.exports = {
  getVenues
};
