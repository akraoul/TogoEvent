/**
 * Configuration de la base de données SQLite
 * TogoEvents Backend
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
    this.dbPath = process.env.DB_PATH || path.join(__dirname, '../../togoevents.db');
  }

  /**
   * Initialise la connexion à la base de données
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Erreur de connexion à la base de données:', err.message);
          reject(err);
        } else {
          console.log('✅ Base de données SQLite connectée:', this.dbPath);
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  /**
   * Crée toutes les tables nécessaires
   */
  async createTables() {
    const tables = [
      // Table des catégories
      `CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE,
        icon TEXT DEFAULT '🎭',
        color TEXT DEFAULT '#f97316',
        is_active BOOLEAN DEFAULT 1,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Table des villes
      `CREATE TABLE IF NOT EXISTS cities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE,
        country TEXT DEFAULT 'TG',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Table des lieux
      `CREATE TABLE IF NOT EXISTS venues (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        city_id TEXT,
        capacity INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (city_id) REFERENCES cities (id)
      )`,

      // Table des événements
      `CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE,
        description TEXT,
        short_description TEXT,
        category_id TEXT,
        organizer_id TEXT,
        venue_id TEXT,
        venue_name TEXT,
        venue_address TEXT,
        start_date DATETIME,
        end_date DATETIME,
        is_free BOOLEAN DEFAULT 0,
        min_price REAL DEFAULT 0,
        max_price REAL DEFAULT 0,
        total_capacity INTEGER DEFAULT 0,
        sold_tickets INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT 0,
        is_promo BOOLEAN DEFAULT 0,
        is_early_bird BOOLEAN DEFAULT 0,
        status TEXT DEFAULT 'draft',
        cover_image TEXT,
        interested_count INTEGER DEFAULT 0,
        view_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id),
        FOREIGN KEY (venue_id) REFERENCES venues (id)
      )`,

      // Table des types de billets
      `CREATE TABLE IF NOT EXISTS ticket_types (
        id TEXT PRIMARY KEY,
        event_id TEXT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL DEFAULT 0,
        currency TEXT DEFAULT 'XOF',
        total_available INTEGER DEFAULT 0,
        sold_tickets INTEGER DEFAULT 0,
        is_on_sale BOOLEAN DEFAULT 1,
        sale_start_date DATETIME,
        sale_end_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      )`
    ];

    for (const table of tables) {
      await this.run(table);
    }

    console.log('✅ Tables créées avec succès');
    await this.insertInitialData();
  }

  /**
   * Insère les données initiales
   */
  async insertInitialData() {
    // Catégories
    const categories = [
      { id: '1', name: 'Concert', slug: 'concert', icon: '🎵', color: '#f97316', order_index: 1 },
      { id: '2', name: 'Festival', slug: 'festival', icon: '🎭', color: '#22c55e', order_index: 2 },
      { id: '3', name: 'Théâtre', slug: 'theatre', icon: '🎪', color: '#6366f1', order_index: 3 },
      { id: '4', name: 'Danse', slug: 'danse', icon: '💃', color: '#ec4899', order_index: 4 },
      { id: '5', name: 'Exposition', slug: 'exposition', icon: '🎨', color: '#8b5cf6', order_index: 5 },
      { id: '6', name: 'Autre', slug: 'autre', icon: '📅', color: '#6b7280', order_index: 6 }
    ];

    for (const cat of categories) {
      await this.run(
        'INSERT OR IGNORE INTO categories (id, name, slug, icon, color, order_index) VALUES (?, ?, ?, ?, ?, ?)',
        [cat.id, cat.name, cat.slug, cat.icon, cat.color, cat.order_index]
      );
    }

    // Villes
    const cities = [
      { id: '1', name: 'Lomé', slug: 'lome', country: 'TG' },
      { id: '2', name: 'Kara', slug: 'kara', country: 'TG' },
      { id: '3', name: 'Sokodé', slug: 'sokode', country: 'TG' },
      { id: '4', name: 'Atakpamé', slug: 'atakpame', country: 'TG' },
      { id: '5', name: 'Kpalimé', slug: 'kpalime', country: 'TG' }
    ];

    for (const city of cities) {
      await this.run(
        'INSERT OR IGNORE INTO cities (id, name, slug, country) VALUES (?, ?, ?, ?)',
        [city.id, city.name, city.slug, city.country]
      );
    }

    // Lieux
    const venues = [
      { id: '1', name: 'Palais des Congrès', address: 'Place de l\'Indépendance, Lomé', city_id: '1', capacity: 2000 },
      { id: '2', name: 'Stade de Kégué', address: 'Route de Kégué, Lomé', city_id: '1', capacity: 30000 },
      { id: '3', name: 'Centre Culturel Français', address: 'Boulevard du Mono, Lomé', city_id: '1', capacity: 500 },
      { id: '4', name: 'Kara Events Center', address: 'Place du Marché, Kara', city_id: '2', capacity: 1000 },
      { id: '5', name: 'Sokodé Cultural Hall', address: 'Avenue du 24 Janvier, Sokodé', city_id: '3', capacity: 800 }
    ];

    for (const venue of venues) {
      await this.run(
        'INSERT OR IGNORE INTO venues (id, name, address, city_id, capacity) VALUES (?, ?, ?, ?, ?)',
        [venue.id, venue.name, venue.address, venue.city_id, venue.capacity]
      );
    }

    console.log('✅ Données initiales insérées avec succès');
  }

  /**
   * Exécute une requête SQL (INSERT, UPDATE, DELETE)
   */
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * Exécute une requête SQL (SELECT) - une seule ligne
   */
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Exécute une requête SQL (SELECT) - plusieurs lignes
   */
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Ferme la connexion à la base de données
   */
  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('✅ Base de données fermée');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Vérifie si la base de données est connectée
   */
  isConnected() {
    return this.db !== null;
  }
}

// Singleton pour la base de données
const database = new Database();

module.exports = database;
