/**
 * TogoEvents Backend API Server
 * N°1 de la billetterie événementielle culturelle au Togo
 */

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

class TogoEventsServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 8000;
    this.dbPath = require('path').join(__dirname, 'togoevents.db');
    this.db = null;
    
    this.initializeMiddleware();
    this.initializeDatabase();
    this.initializeRoutes();
  }

  initializeMiddleware() {
    // Sécurité
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    // Logging
    this.app.use(morgan('combined'));
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Static files
    this.app.use('/media', express.static(path.join(__dirname, 'media')));
  }

  initializeDatabase() {
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('❌ Erreur de connexion à la base de données:', err.message);
        process.exit(1);
      } else {
        console.log('✅ Base de données SQLite connectée');
        this.db.serialize(() => {
      this.createTables();
              this.insertInitialData();
    });
      }
    });
  }

  createTables() {
    // Table des catégories
    this.db.run(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE,
        icon TEXT DEFAULT '🎭',
        color TEXT DEFAULT '#f97316',
        is_active BOOLEAN DEFAULT 1,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des villes
    this.db.run(`
      CREATE TABLE IF NOT EXISTS cities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE,
        country TEXT DEFAULT 'TG',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des lieux
    this.db.run(`
      CREATE TABLE IF NOT EXISTS venues (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT,
        city_id TEXT,
        capacity INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (city_id) REFERENCES cities (id)
      )
    `);

    // Table des événements
    this.db.run(`
      CREATE TABLE IF NOT EXISTS events (
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
      )
    `);

    // Table des types de billets
    this.db.run(`
      CREATE TABLE IF NOT EXISTS ticket_types (
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
      )
    `);

    console.log('✅ Tables créées avec succès');
  }

  insertInitialData() {
    // Insérer les catégories
    const categories = [
      { id: '1', name: 'Concert', slug: 'concert', icon: '🎵', color: '#f97316', order_index: 1 },
      { id: '2', name: 'Festival', slug: 'festival', icon: '🎭', color: '#22c55e', order_index: 2 },
      { id: '3', name: 'Théâtre', slug: 'theatre', icon: '🎪', color: '#6366f1', order_index: 3 },
      { id: '4', name: 'Danse', slug: 'danse', icon: '💃', color: '#ec4899', order_index: 4 },
      { id: '5', name: 'Exposition', slug: 'exposition', icon: '🎨', color: '#8b5cf6', order_index: 5 },
      { id: '6', name: 'Autre', slug: 'autre', icon: '📅', color: '#6b7280', order_index: 6 }
    ];

    const categoryStmt = this.db.prepare(`
      INSERT OR IGNORE INTO categories (id, name, slug, icon, color, order_index) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    categories.forEach(cat => {
      categoryStmt.run([cat.id, cat.name, cat.slug, cat.icon, cat.color, cat.order_index]);
    });
    categoryStmt.finalize();

    // Insérer les villes
    const cities = [
      { id: '1', name: 'Lomé', slug: 'lome', country: 'TG' },
      { id: '2', name: 'Kara', slug: 'kara', country: 'TG' },
      { id: '3', name: 'Sokodé', slug: 'sokode', country: 'TG' },
      { id: '4', name: 'Atakpamé', slug: 'atakpame', country: 'TG' },
      { id: '5', name: 'Kpalimé', slug: 'kpalime', country: 'TG' }
    ];

    const cityStmt = this.db.prepare(`
      INSERT OR IGNORE INTO cities (id, name, slug, country) 
      VALUES (?, ?, ?, ?)
    `);

    cities.forEach(city => {
      cityStmt.run([city.id, city.name, city.slug, city.country]);
    });
    cityStmt.finalize();

    // Insérer les lieux par défaut
    const venues = [
      { id: '1', name: 'Palais des Congrès', address: 'Place de l\'Indépendance, Lomé', city_id: '1', capacity: 2000 },
      { id: '2', name: 'Stade de Kégué', address: 'Route de Kégué, Lomé', city_id: '1', capacity: 30000 },
      { id: '3', name: 'Centre Culturel Français', address: 'Boulevard du Mono, Lomé', city_id: '1', capacity: 500 },
      { id: '4', name: 'Kara Events Center', address: 'Place du Marché, Kara', city_id: '2', capacity: 1000 },
      { id: '5', name: 'Sokodé Cultural Hall', address: 'Avenue du 24 Janvier, Sokodé', city_id: '3', capacity: 800 }
    ];

    const venueStmt = this.db.prepare(`
      INSERT OR IGNORE INTO venues (id, name, address, city_id, capacity) 
      VALUES (?, ?, ?, ?, ?)
    `);

    venues.forEach(venue => {
      venueStmt.run([venue.id, venue.name, venue.address, venue.city_id, venue.capacity]);
    });
    venueStmt.finalize();

    console.log('✅ Données initiales insérées avec succès');
  }

  initializeRoutes() {
    // API Routes
    this.app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        message: 'TogoEvents API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // Routes pour les événements
    this.app.get('/api/events', this.getEvents.bind(this));
    this.app.post('/api/events', this.createEvent.bind(this));
    this.app.get('/api/events/:id', this.getEvent.bind(this));
    this.app.put('/api/events/:id', this.updateEvent.bind(this));
    this.app.delete('/api/events/:id', this.deleteEvent.bind(this));

    // Routes pour les catégories
    this.app.get('/api/categories', this.getCategories.bind(this));

    // Routes pour les villes
    this.app.get('/api/cities', this.getCities.bind(this));

    // Routes pour les lieux
    this.app.get('/api/venues', this.getVenues.bind(this));

    // Route par défaut
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} non trouvée`,
        available_routes: [
          'GET /api/health',
          'GET /api/events',
          'POST /api/events',
          'GET /api/events/:id',
          'GET /api/categories',
          'GET /api/cities',
          'GET /api/venues'
        ]
      });
    });

    // Gestion des erreurs
    this.app.use((err, req, res, next) => {
      console.error('❌ Erreur serveur:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
      });
    });
  }

  // Méthodes pour les événements
  async getEvents(req, res) {
    try {
      const query = `
        SELECT 
          e.*,
          c.name as category_name,
          c.icon as category_icon,
          c.color as category_color,
          v.name as venue_name,
          v.address as venue_address,
          ci.name as city_name,
          ci.slug as city_slug
        FROM events e
        LEFT JOIN categories c ON e.category_id = c.id
        LEFT JOIN venues v ON e.venue_id = v.id
        LEFT JOIN cities ci ON v.city_id = ci.id
        WHERE e.status = 'published'
        ORDER BY e.created_at DESC
      `;

      this.db.all(query, [], (err, rows) => {
        if (err) {
          console.error('❌ Erreur lors de la récupération des événements:', err);
          return res.status(500).json({ error: 'Erreur lors de la récupération des événements' });
        }

        const events = rows.map(row => ({
          id: row.id,
          title: row.title,
          slug: row.slug,
          description: row.description,
          short_description: row.short_description,
          category: row.category_name ? {
            id: row.category_id,
            name: row.category_name,
            icon: row.category_icon,
            color: row.category_color
          } : null,
          venue: row.venue_name ? {
            id: row.venue_id,
            name: row.venue_name,
            address: row.venue_address,
            city: row.city_name ? {
              id: row.city_id,
              name: row.city_name,
              slug: row.city_slug
            } : null
          } : {
            name: row.venue_name,
            address: row.venue_address
          },
          start_date: row.start_date,
          end_date: row.end_date,
          is_free: Boolean(row.is_free),
          min_price: row.min_price,
          max_price: row.max_price,
          total_capacity: row.total_capacity,
          sold_tickets: row.sold_tickets,
          is_featured: Boolean(row.is_featured),
          is_promo: Boolean(row.is_promo),
          is_early_bird: Boolean(row.is_early_bird),
          status: row.status,
          cover_image: row.cover_image,
          interested_count: row.interested_count,
          view_count: row.view_count,
          created_at: row.created_at,
          updated_at: row.updated_at
        }));

        res.json(events);
      });
    } catch (error) {
      console.error('❌ Erreur getEvents:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  async createEvent(req, res) {
    try {
      const {
        title,
        description,
        shortDescription,
        categoryId,
        venueName,
        venueAddress,
        startDate,
        endDate,
        isFree,
        minPrice,
        maxPrice,
        totalCapacity,
        ticketTypes,
        isFeatured,
        isPromo,
        coverImage
      } = req.body;

      // Validation des champs requis
      const requiredFields = ['title', 'categoryId', 'venueName', 'venueAddress', 'startDate'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: `Champs requis manquants: ${missingFields.join(', ')}`
        });
      }

      // Générer un slug unique
      let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const originalSlug = slug;
      let counter = 1;

      // Vérifier si le slug existe déjà
      const checkSlug = () => {
        return new Promise((resolve, reject) => {
          this.db.get('SELECT id FROM events WHERE slug = ?', [slug], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      };

      let existingEvent = await checkSlug();
      while (existingEvent) {
        slug = `${originalSlug}-${counter}`;
        counter++;
        existingEvent = await checkSlug();
      }

      // Créer ou récupérer le lieu personnalisé
      let venueId = null;
      if (venueName && venueAddress) {
        // D'abord essayer de trouver un lieu existant
        const venue = await new Promise((resolve, reject) => {
          this.db.get(
            'SELECT id FROM venues WHERE name = ? AND address = ?',
            [venueName, venueAddress],
            (err, row) => {
              if (err) reject(err);
              else resolve(row);
            }
          );
        });

        if (venue) {
          venueId = venue.id;
        } else {
          // Créer un nouveau lieu
          venueId = uuidv4();
          await new Promise((resolve, reject) => {
            this.db.run(
              'INSERT INTO venues (id, name, address, city_id, capacity) VALUES (?, ?, ?, ?, ?)',
              [venueId, venueName, venueAddress, '1', totalCapacity || 100],
              function(err) {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }

      // Insérer l'événement
      const eventId = uuidv4();
      const now = new Date().toISOString();

      await new Promise((resolve, reject) => {
        this.db.run(`
          INSERT INTO events (
            id, title, slug, description, short_description, category_id,
            venue_id, venue_name, venue_address, start_date, end_date,
            is_free, min_price, max_price, total_capacity, is_featured, is_promo,
            status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          eventId, title, slug, description || '', shortDescription || '', categoryId,
          venueId, venueName, venueAddress, startDate, endDate || startDate,
          isFree || false, minPrice || 0, maxPrice || 0, totalCapacity || 0,
          isFeatured || false, isPromo || false, 'published', now, now
        ], function(err) {
          if (err) reject(err);
          else resolve();
        });
      });

      // Insérer les types de billets
      if (ticketTypes && Array.isArray(ticketTypes) && ticketTypes.length > 0) {
        for (const ticketType of ticketTypes) {
          const ticketId = uuidv4();
          await new Promise((resolve, reject) => {
            this.db.run(`
              INSERT INTO ticket_types (
                id, event_id, name, description, price, currency, total_available
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
              ticketId, eventId, ticketType.name || 'Standard', ticketType.description || '',
              ticketType.price || 0, 'XOF', ticketType.quantity || 0
            ], function(err) {
              if (err) reject(err);
              else resolve();
            });
          });
        }
      }

      const response = {
        id: eventId,
        message: 'Événement créé avec succès',
        status: 'published',
        slug: slug
      };

      console.log(`✅ Événement créé: ${title} (${eventId})`);
      res.status(201).json(response);

    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'événement:', error);
      res.status(500).json({
        error: 'Erreur lors de la création de l\'événement',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async getEvent(req, res) {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT 
          e.*,
          c.name as category_name,
          c.icon as category_icon,
          c.color as category_color,
          v.name as venue_name,
          v.address as venue_address,
          ci.name as city_name,
          ci.slug as city_slug
        FROM events e
        LEFT JOIN categories c ON e.category_id = c.id
        LEFT JOIN venues v ON e.venue_id = v.id
        LEFT JOIN cities ci ON v.city_id = ci.id
        WHERE e.id = ?
      `;

      this.db.get(query, [id], (err, row) => {
        if (err) {
          console.error('❌ Erreur lors de la récupération de l\'événement:', err);
          return res.status(500).json({ error: 'Erreur lors de la récupération de l\'événement' });
        }

        if (!row) {
          return res.status(404).json({ error: 'Événement non trouvé' });
        }

        // Récupérer les types de billets
        this.db.all(
          'SELECT * FROM ticket_types WHERE event_id = ?',
          [id],
          (ticketErr, ticketRows) => {
            if (ticketErr) {
              console.error('❌ Erreur lors de la récupération des billets:', ticketErr);
              return res.status(500).json({ error: 'Erreur lors de la récupération des billets' });
            }

            const event = {
              id: row.id,
              title: row.title,
              slug: row.slug,
              description: row.description,
              short_description: row.short_description,
              category: row.category_name ? {
                id: row.category_id,
                name: row.category_name,
                icon: row.category_icon,
                color: row.category_color
              } : null,
              venue: row.venue_name ? {
                id: row.venue_id,
                name: row.venue_name,
                address: row.venue_address,
                city: row.city_name ? {
                  id: row.city_id,
                  name: row.city_name,
                  slug: row.city_slug
                } : null
              } : null,
              start_date: row.start_date,
              end_date: row.end_date,
              is_free: Boolean(row.is_free),
              min_price: row.min_price,
              max_price: row.max_price,
              total_capacity: row.total_capacity,
              sold_tickets: row.sold_tickets,
              is_featured: Boolean(row.is_featured),
              is_promo: Boolean(row.is_promo),
              is_early_bird: Boolean(row.is_early_bird),
              status: row.status,
              cover_image: row.cover_image,
              interested_count: row.interested_count,
              view_count: row.view_count,
              created_at: row.created_at,
              updated_at: row.updated_at,
              ticket_types: ticketRows.map(tt => ({
                id: tt.id,
                name: tt.name,
                description: tt.description,
                price: tt.price,
                currency: tt.currency,
                total_available: tt.total_available,
                sold_tickets: tt.sold_tickets,
                available: tt.total_available - tt.sold_tickets,
                is_on_sale: Boolean(tt.is_on_sale),
                sale_start_date: tt.sale_start_date,
                sale_end_date: tt.sale_end_date
              }))
            };

            res.json(event);
          }
        );
      });
    } catch (error) {
      console.error('❌ Erreur getEvent:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  async getCategories(req, res) {
    try {
      this.db.all(
        'SELECT * FROM categories WHERE is_active = 1 ORDER BY order_index, name',
        [],
        (err, rows) => {
          if (err) {
            console.error('❌ Erreur lors de la récupération des catégories:', err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
          }
          res.json(rows);
        }
      );
    } catch (error) {
      console.error('❌ Erreur getCategories:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  async getCities(req, res) {
    try {
      this.db.all(
        'SELECT * FROM cities ORDER BY name',
        [],
        (err, rows) => {
          if (err) {
            console.error('❌ Erreur lors de la récupération des villes:', err);
            return res.status(500).json({ error: 'Erreur lors de la récupération des villes' });
          }
          res.json(rows);
        }
      );
    } catch (error) {
      console.error('❌ Erreur getCities:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  async getVenues(req, res) {
    try {
      const cityId = req.query.city_id;
      
      let query = `
        SELECT v.*, c.name as city_name, c.slug as city_slug
        FROM venues v
        LEFT JOIN cities c ON v.city_id = c.id
      `;
      let params = [];
      
      if (cityId) {
        query += ' WHERE v.city_id = ?';
        params = [cityId];
      }
      
      query += ' ORDER BY v.name';

      this.db.all(query, params, (err, rows) => {
        if (err) {
          console.error('❌ Erreur lors de la récupération des lieux:', err);
          return res.status(500).json({ error: 'Erreur lors de la récupération des lieux' });
        }
        res.json(rows);
      });
    } catch (error) {
      console.error('❌ Erreur getVenues:', error);
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }

  async updateEvent(req, res) {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  async deleteEvent(req, res) {
    res.status(501).json({ error: 'Not implemented yet' });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log('\n🎭 TogoEvents Backend API Server');
      console.log('📍 URL: http://localhost:' + this.port);
      console.log('🔗 API Events: http://localhost:' + this.port + '/api/events');
      console.log('📊 Database: SQLite (' + this.dbPath + ')');
      console.log('🚀 Environment: ' + (process.env.NODE_ENV || 'development'));
      console.log('=' * 60);
      console.log('✅ Serveur démarré avec succès sur le port ' + this.port);
      console.log('🔄 Appuyez Ctrl+C pour arrêter');
      console.log('=' * 60 + '\n');
    });
  }

  stop() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('❌ Erreur lors de la fermeture de la base de données:', err);
        } else {
          console.log('✅ Base de données fermée');
        }
      });
    }
  }
}

// Gestion de l'arrêt gracieux
const server = new TogoEventsServer();

process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  server.stop();
  process.exit(0);
});

// Démarrer le serveur
server.start();

module.exports = TogoEventsServer;
