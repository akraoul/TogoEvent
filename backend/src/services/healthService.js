const { getDatabase } = require('../plugins/db');

const getHealth = async () => {
  const db = getDatabase();
  
  try {
    // Test database connection
    db.prepare('SELECT 1').get();
    
    return {
      status: 'OK',
      message: 'TogoEvents API is running',
      timestamp: new Date().toISOString(),
      database: 'SQLite',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    };
  } catch (error) {
    return {
      status: 'ERROR',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
};

module.exports = {
  getHealth
};
