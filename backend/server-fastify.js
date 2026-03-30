/**
 * TogoEvents Backend API Server - Fastify Version
 * N°1 de la billetterie événementielle culturelle au Togo
 */

const fastify = require('fastify')({ logger: true });
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

class TogoEventsFastifyServer {
  constructor() {
    this.port = process.env.PORT || 8000;
    this.dbPath = require('path').join(__dirname, 'togoevents.db');
    this.db = null;
    
    this.initializePlugins();
    this.initializeDatabase();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  async initializePlugins() {
    // Enregistrer les plugins Fastify
    await fastify.register(require('@fastify/cors'), {
      origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    });

    await fastify.register(require('@fastify/helmet'), {
      contentSecurityPolicy: false
    });

    await fastify.register(require('@fastify/rate-limit'), {
      max: 100,
      timeWindow: '1 minute'
    });

    await fastify.register(require('@fastify/static'), {
      root: path.join(__dirname, 'media'),
      prefix: '/media/'
    });

    // Configuration du body parser
    fastify.addHook('preHandler', async (request, reply) => {
      if (request.body && typeof request.body === 'string') {
        try {
          request.body = JSON.parse(request.body);
        } catch (e) {
          // Ignorer si ce n'est pas du JSON
        }
      }
    });
  }

  initializeDatabase() {
    try {
      this.db = new Database(this.dbPath);
      console.log('✅ Base de données SQLite connectée');
      this.createTables();
      this.insertInitialData();
    } catch (err) {
      console.error('❌ Erreur de connexion à la base de données:', err.message);
      process.exit(1);
    }
  }

  createTables() {
    // Table des catégories
    this.db.exec(`
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
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cities (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE,
        country TEXT DEFAULT 'TG',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des lieux
    this.db.exec(`
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
    this.db.exec(`
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
    this.db.exec(`
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

    console.log('✅ Données initiales insérées avec succès');
  }

  initializeRoutes() {
    // Health check
    fastify.get('/api/health', async (request, reply) => {
      return { 
        status: 'OK', 
        message: 'TogoEvents API is running with Fastify',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
    });

    // Routes pour les événements
    fastify.get('/api/events', this.getEvents.bind(this));
    fastify.post('/api/events', this.createEvent.bind(this));
    fastify.get('/api/events/:id', this.getEvent.bind(this));
    fastify.put('/api/events/:id', this.updateEvent.bind(this));
    fastify.delete('/api/events/:id', this.deleteEvent.bind(this));

    // Routes pour les catégories
    fastify.get('/api/categories', this.getCategories.bind(this));

    // Routes pour les villes
    fastify.get('/api/cities', this.getCities.bind(this));

    // Routes pour les lieux
    fastify.get('/api/venues', this.getVenues.bind(this));

    // Route 404
    fastify.setNotFoundHandler(async (request, reply) => {
      return reply.status(404).send({
        error: 'Not Found',
        message: `Route ${request.url} non trouvée`,
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
  }

  initializeErrorHandling() {
    fastify.setErrorHandler(async (error, request, reply) => {
      console.error('❌ Erreur Fastify:', error);
      
      if (error.validation) {
        return reply.status(400).send({
          error: 'Validation Error',
          message: error.message,
          details: error.validation
        });
      }

      return reply.status(500).send({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Une erreur est survenue'
      });
    });
  }

  // Méthodes pour les événements
  async getEvents(request, reply) {
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

      const rows = this.db.all(query, []);

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

      return events;
    } catch (error) {
      console.error('❌ Erreur getEvents:', error);
      throw error;
    }
  }

  async createEvent(request, reply) {
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
      } = request.body;

      // Validation des champs requis
      const requiredFields = ['title', 'categoryId', 'venueName', 'venueAddress', 'startDate'];
      const missingFields = requiredFields.filter(field => !request.body[field]);
      
      if (missingFields.length > 0) {
        return reply.status(400).send({
          error: `Champs requis manquants: ${missingFields.join(', ')}`
        });
      }

      // Générer un slug unique
      let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      const originalSlug = slug;
      let counter = 1;

      // Vérifier si le slug existe déjà
      const checkSlug = () => {
        return this.db.get('SELECT id FROM events WHERE slug = ?', [slug]);
      };

      let existingEvent = checkSlug();
      while (existingEvent) {
        slug = `${originalSlug}-${counter}`;
        counter++;
        existingEvent = checkSlug();
      }

      // Créer ou récupérer le lieu personnalisé
      let venueId = null;
      if (venueName && venueAddress) {
        // D'abord essayer de trouver un lieu existant
        const venue = this.db.get(
          'SELECT id FROM venues WHERE name = ? AND address = ?',
          [venueName, venueAddress]
        );

        if (venue) {
          venueId = venue.id;
        } else {
          // Créer un nouveau lieu
          venueId = uuidv4();
          this.db.run(
            'INSERT INTO venues (id, name, address, city_id, capacity) VALUES (?, ?, ?, ?, ?)',
            [venueId, venueName, venueAddress, '1', totalCapacity || 100]
          );
        }
      }

      // Insérer l'événement
      const eventId = uuidv4();
      const now = new Date().toISOString();

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
      ]);

      // Insérer les types de billets
      if (ticketTypes && Array.isArray(ticketTypes) && ticketTypes.length > 0) {
        for (const ticketType of ticketTypes) {
          const ticketId = uuidv4();
          this.db.run(`
            INSERT INTO ticket_types (
              id, event_id, name, description, price, currency, total_available
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            ticketId, eventId, ticketType.name || 'Standard', ticketType.description || '',
            ticketType.price || 0, 'XOF', ticketType.quantity || 0
          ]);
        }
      }

      const response = {
        id: eventId,
        message: 'Événement créé avec succès',
        status: 'published',
        slug: slug
      };

      console.log(`✅ Événement créé: ${title} (${eventId})`);
      return reply.status(201).send(response);

    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'événement:', error);
      throw error;
    }
  }

  async getEvent(request, reply) {
    try {
      const { id } = request.params;
      
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

      const row = this.db.get(query, [id]);

      if (!row) {
        return reply.status(404).send({ error: 'Événement non trouvé' });
      }

      // Récupérer les types de billets
      const ticketRows = this.db.all(
        'SELECT * FROM ticket_types WHERE event_id = ?',
        [id]
      );

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

      return event;
    } catch (error) {
      console.error('❌ Erreur getEvent:', error);
      throw error;
    }
  }

  async getCategories(request, reply) {
    try {
      const rows = this.db.all(
        'SELECT * FROM categories WHERE is_active = 1 ORDER BY order_index, name',
        []
      );
      return rows;
    } catch (error) {
      console.error('❌ Erreur getCategories:', error);
      throw error;
    }
  }

  async getCities(request, reply) {
    try {
      const rows = this.db.all(
        'SELECT * FROM cities ORDER BY name',
        []
      );
      return rows;
    } catch (error) {
      console.error('❌ Erreur getCities:', error);
      throw error;
    }
  }

  async getVenues(request, reply) {
    try {
      const { city_id } = request.query;
      
      let query = `
        SELECT v.*, c.name as city_name, c.slug as city_slug
        FROM venues v
        LEFT JOIN cities c ON v.city_id = c.id
      `;
      let params = [];
      
      if (city_id) {
        query += ' WHERE v.city_id = ?';
        params = [city_id];
      }
      
      query += ' ORDER BY v.name';

      const rows = this.db.all(query, params);
      return rows;
    } catch (error) {
      console.error('❌ Erreur getVenues:', error);
      throw error;
    }
  }

  async updateEvent(request, reply) {
    return reply.status(501).send({ error: 'Not implemented yet' });
  }

  async deleteEvent(request, reply) {
    return reply.status(501).send({ error: 'Not implemented yet' });
  }

  async start() {
    console.log('🚀 Tentative de démarrage du serveur Fastify...');
    try {
      console.log('📡 Configuration du listener sur le port', this.port);
      await fastify.listen({ port: this.port, host: '0.0.0.0' });
      console.log('✅ Listener configuré avec succès');
      console.log('\n🎭 TogoEvents Backend API Server (Fastify)');
      console.log('📍 URL: http://localhost:' + this.port);
      console.log('🔗 API Events: http://localhost:' + this.port + '/api/events');
      console.log('📊 Database: SQLite (' + this.dbPath + ')');
      console.log('🚀 Environment: ' + (process.env.NODE_ENV || 'development'));
      console.log('='.repeat(60));
      console.log('✅ Serveur Fastify démarré avec succès sur le port ' + this.port);
      console.log('🔄 Appuyez Ctrl+C pour arrêter');
      console.log('='.repeat(60) + '\n');
    } catch (err) {
      console.error('❌ Erreur détaillée lors du démarrage du serveur:', err);
      console.error('❌ Stack trace:', err.stack);
      process.exit(1);
    }
  }

  stop() {
    if (this.db) {
      this.db.close();
      console.log('✅ Base de données fermée');
    }
    fastify.close();
  }
}

// Gestion de l'arrêt gracieux
const server = new TogoEventsFastifyServer();

process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur Fastify...');
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt du serveur Fastify...');
  await server.stop();
  process.exit(0);
});

// Démarrer le serveur
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// Démarrer le serveur
server.start().catch(err => {
  console.error('❌ Erreur au démarrage:', err);
  process.exit(1);
});

module.exports = TogoEventsFastifyServer;
