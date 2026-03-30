const Database = require('better-sqlite3');
const path = require('path');

let db = null;

const initializeDatabase = () => {
  if (db) return db;
  
  const dbPath = process.env.NODE_ENV === 'production' 
    ? path.join('/tmp', 'togoevents.db') 
    : path.join(__dirname, '../../database', 'togoevents.db');
  
  db = new Database(dbPath);
  console.log(`✅ Base de données SQLite connectée sur: ${dbPath}`);
  
  // Création des tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE,
      icon TEXT DEFAULT '🎭',
      color TEXT DEFAULT '#f97316',
      is_active BOOLEAN DEFAULT 1,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS cities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE,
      country TEXT DEFAULT 'TG',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS venues (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      city_id TEXT,
      capacity INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (city_id) REFERENCES cities (id)
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      short_description TEXT,
      category_id TEXT,
      organizer_id TEXT,
      venue_id TEXT,
      start_date DATETIME,
      end_date DATETIME,
      is_free BOOLEAN DEFAULT 0,
      image_url TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (organizer_id) REFERENCES organizers(id),
      FOREIGN KEY (venue_id) REFERENCES venues(id)
    );

    CREATE TABLE IF NOT EXISTS organizers (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      is_verified BOOLEAN DEFAULT 0,
      rating REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ticket_types (
      id TEXT PRIMARY KEY,
      event_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL,
      currency TEXT DEFAULT 'XOF',
      total_available INTEGER,
      sold_tickets INTEGER DEFAULT 0,
      is_sold_out BOOLEAN DEFAULT 0,
      is_on_sale BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id)
    );
  `);

  // Insertion des données initiales
  initializeData();
  
  return db;
};

const initializeData = () => {
  // Insertion des catégories initiales
  const categoryStmt = db.prepare(`
    INSERT OR IGNORE INTO categories (id, name, slug, icon, color) 
    VALUES (?, ?, ?, ?, ?)
  `);

  const categories = [
    ['1', 'Concert', 'concert', '🎵', '#f97316'],
    ['2', 'Théâtre', 'theatre', '🎭', '#8b5cf6'],
    ['3', 'Sport', 'sport', '⚽', '#10b981'],
    ['4', 'Conférence', 'conference', '🎤', '#3b82f6'],
    ['5', 'Festival', 'festival', '🎉', '#ec4899'],
    ['6', 'Exposition', 'exposition', '🎨', '#f59e0b']
  ];

  categories.forEach(cat => categoryStmt.run(cat));

  // Insertion des villes initiales
  const cityStmt = db.prepare(`
    INSERT OR IGNORE INTO cities (id, name, slug) 
    VALUES (?, ?, ?)
  `);

  const cities = [
    ['1', 'Lomé', 'lome'],
    ['2', 'Kara', 'kara'],
    ['3', 'Sokodé', 'sokode'],
    ['4', 'Atakpamé', 'atakpame'],
    ['5', 'Kpalimé', 'kpalime']
  ];

  cities.forEach(city => cityStmt.run(city));
};

const getDatabase = () => {
  if (!db) {
    return initializeDatabase();
  }
  return db;
};

module.exports = {
  initializeDatabase,
  getDatabase
};
