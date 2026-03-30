/**
 * TogoEvents Backend API Server - Fastify Version (Minimal)
 */

const fastify = require('fastify')({ logger: false });
const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config();

const port = process.env.PORT || 8000;
const dbPath = path.join(__dirname, 'togoevents.db');

// Initialisation de la base de données
const db = new Database(dbPath);
console.log('✅ Base de données SQLite connectée');

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
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS cities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    country TEXT DEFAULT 'TG',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
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

db.exec(`
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

console.log('✅ Tables créées avec succès');

// Insertion des données initiales
const categoryStmt = db.prepare(`
  INSERT OR IGNORE INTO categories (id, name, slug, icon, color, order_index) 
  VALUES (?, ?, ?, ?, ?, ?)
`);

const categories = [
  { id: '1', name: 'Concert', slug: 'concert', icon: '🎵', color: '#f97316', order_index: 1 },
  { id: '2', name: 'Festival', slug: 'festival', icon: '🎭', color: '#22c55e', order_index: 2 },
  { id: '3', name: 'Théâtre', slug: 'theatre', icon: '🎪', color: '#6366f1', order_index: 3 },
  { id: '4', name: 'Danse', slug: 'danse', icon: '💃', color: '#ec4899', order_index: 4 },
  { id: '5', name: 'Exposition', slug: 'exposition', icon: '🎨', color: '#8b5cf6', order_index: 5 },
  { id: '6', name: 'Autre', slug: 'autre', icon: '📅', color: '#6b7280', order_index: 6 }
];

categories.forEach(cat => {
  categoryStmt.run([cat.id, cat.name, cat.slug, cat.icon, cat.color, cat.order_index]);
});

console.log('✅ Données initiales insérées avec succès');

// Middleware CORS
fastify.addHook('preHandler', async (request, reply) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
});

// Routes
fastify.get('/api/health', async (request, reply) => {
  return { 
    status: 'OK', 
    message: 'TogoEvents API is running with Fastify',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
});

fastify.get('/api/events', async (request, reply) => {
  try {
    const stmt = db.prepare(`
      SELECT 
        e.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE e.status = 'published'
      ORDER BY e.created_at DESC
    `);

    const rows = stmt.all();

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
      venue: {
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
});

fastify.post('/api/events', async (request, reply) => {
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

    // Conversion des types
    const isFreeBool = Boolean(isFree);
    const isFeaturedBool = Boolean(isFeatured);
    const isPromoBool = Boolean(isPromo);
    const minPriceNum = isFreeBool ? 0 : Number(minPrice) || 0;
    const maxPriceNum = isFreeBool ? 0 : Number(maxPrice) || 0;
    const totalCapacityNum = Number(totalCapacity) || 0;

    // Générer un slug unique
    let slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const originalSlug = slug;
    let counter = 1;

    // Vérifier si le slug existe déjà
    const checkSlug = () => {
      const stmt = db.prepare('SELECT id FROM events WHERE slug = ?');
      return stmt.get([slug]);
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
      const venueStmt = db.prepare('SELECT id FROM venues WHERE name = ? AND address = ?');
      const venue = venueStmt.get([venueName, venueAddress]);

      if (venue) {
        venueId = venue.id;
      } else {
        // Créer un nouveau lieu
        venueId = uuidv4();
        const insertVenueStmt = db.prepare(
          'INSERT INTO venues (id, name, address, city_id, capacity) VALUES (?, ?, ?, ?, ?)'
        );
        insertVenueStmt.run([venueId, venueName, venueAddress, '1', totalCapacityNum]);
      }
    }

    // Insérer l'événement
    const eventId = uuidv4();
    const now = new Date().toISOString();

    const insertEventStmt = db.prepare(`
      INSERT INTO events (
        id, title, slug, description, short_description, category_id,
        venue_id, venue_name, venue_address, start_date, end_date,
        is_free, min_price, max_price, total_capacity, is_featured, is_promo,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertEventStmt.run([
      eventId, title, slug, description || '', shortDescription || '', categoryId,
      venueId, venueName, venueAddress, startDate, endDate || startDate,
      isFreeBool ? 1 : 0, minPriceNum, maxPriceNum, totalCapacityNum,
      isFeaturedBool ? 1 : 0, isPromoBool ? 1 : 0, 'published', now, now
    ]);

    // Insérer les types de billets
    if (ticketTypes && Array.isArray(ticketTypes) && ticketTypes.length > 0) {
      const insertTicketStmt = db.prepare(`
        INSERT INTO ticket_types (
          id, event_id, name, description, price, currency, total_available
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const ticketType of ticketTypes) {
        const ticketId = uuidv4();
        const ticketPrice = Number(ticketType.price) || 0;
        const ticketQuantity = Number(ticketType.quantity) || 0;
        
        insertTicketStmt.run([
          ticketId, eventId, ticketType.name || 'Standard', ticketType.description || '',
          ticketPrice, 'XOF', ticketQuantity
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
});

fastify.get('/api/categories', async (request, reply) => {
  try {
    const stmt = db.prepare('SELECT * FROM categories WHERE is_active = 1 ORDER BY order_index, name');
    const rows = stmt.all();
    return rows;
  } catch (error) {
    console.error('❌ Erreur getCategories:', error);
    throw error;
  }
});

fastify.get('/api/cities', async (request, reply) => {
  try {
    const stmt = db.prepare('SELECT * FROM cities ORDER BY name');
    const rows = stmt.all();
    return rows;
  } catch (error) {
    console.error('❌ Erreur getCities:', error);
    throw error;
  }
});

fastify.get('/api/venues', async (request, reply) => {
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

    const stmt = db.prepare(query);
    const rows = stmt.all(params);
    return rows;
  } catch (error) {
    console.error('❌ Erreur getVenues:', error);
    throw error;
  }
});

// Démarrage du serveur
const start = async () => {
  try {
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log('\n🎭 TogoEvents Backend API Server (Fastify)');
    console.log('📍 URL: http://localhost:' + port);
    console.log('🔗 API Events: http://localhost:' + port + '/api/events');
    console.log('📊 Database: SQLite (' + dbPath + ')');
    console.log('🚀 Environment: ' + (process.env.NODE_ENV || 'development'));
    console.log('='.repeat(60));
    console.log('✅ Serveur Fastify démarré avec succès sur le port ' + port);
    console.log('🔄 Appuyez Ctrl+C pour arrêter');
    console.log('='.repeat(60) + '\n');
  } catch (err) {
    console.error('❌ Erreur au démarrage:', err);
    process.exit(1);
  }
};

// Gestion de l'arrêt
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur Fastify...');
  db.close();
  console.log('✅ Base de données fermée');
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Arrêt du serveur Fastify...');
  db.close();
  console.log('✅ Base de données fermée');
  await fastify.close();
  process.exit(0);
});

// Démarrer
start();
