/**
 * Modèle Événement
 * TogoEvents Backend
 */

const database = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Event {
  /**
   * Crée un nouvel événement
   */
  static async create(eventData) {
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
      coverImage,
      organizerId
    } = eventData;

    // Générer un slug unique
    const slug = await this.generateUniqueSlug(title);

    // Créer ou récupérer le lieu
    let venueId = null;
    if (venueName && venueAddress) {
      venueId = await this.createOrGetVenue(venueName, venueAddress, totalCapacity);
    }

    const eventId = uuidv4();
    const now = new Date().toISOString();

    // Insérer l'événement
    await database.run(`
      INSERT INTO events (
        id, title, slug, description, short_description, category_id,
        venue_id, venue_name, venue_address, start_date, end_date,
        is_free, min_price, max_price, total_capacity, is_featured, is_promo,
        status, created_at, updated_at, organizer_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      eventId, title, slug, description || '', shortDescription || '', categoryId,
      venueId, venueName, venueAddress, startDate, endDate || startDate,
      isFree || false, minPrice || 0, maxPrice || 0, totalCapacity || 0,
      isFeatured || false, isPromo || false, 'published', now, now, organizerId
    ]);

    // Insérer les types de billets
    if (ticketTypes && Array.isArray(ticketTypes) && ticketTypes.length > 0) {
      await this.createTicketTypes(eventId, ticketTypes);
    }

    return { id: eventId, slug };
  }

  /**
   * Génère un slug unique
   */
  static async generateUniqueSlug(title) {
    let slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const originalSlug = slug;
    let counter = 1;

    // Vérifier si le slug existe déjà
    while (await this.slugExists(slug)) {
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Vérifie si un slug existe
   */
  static async slugExists(slug) {
    const result = await database.get('SELECT id FROM events WHERE slug = ?', [slug]);
    return !!result;
  }

  /**
   * Crée ou récupère un lieu
   */
  static async createOrGetVenue(name, address, capacity) {
    // D'abord essayer de trouver un lieu existant
    const existingVenue = await database.get(
      'SELECT id FROM venues WHERE name = ? AND address = ?',
      [name, address]
    );

    if (existingVenue) {
      return existingVenue.id;
    }

    // Créer un nouveau lieu
    const venueId = uuidv4();
    await database.run(
      'INSERT INTO venues (id, name, address, city_id, capacity) VALUES (?, ?, ?, ?, ?)',
      [venueId, name, address, '1', capacity || 100]
    );

    return venueId;
  }

  /**
   * Crée les types de billets pour un événement
   */
  static async createTicketTypes(eventId, ticketTypes) {
    for (const ticketType of ticketTypes) {
      const ticketId = uuidv4();
      await database.run(`
        INSERT INTO ticket_types (
          id, event_id, name, description, price, currency, total_available
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        ticketId, eventId, ticketType.name || 'Standard', ticketType.description || '',
        ticketType.price || 0, 'XOF', ticketType.quantity || 0
      ]);
    }
  }

  /**
   * Récupère tous les événements publiés
   */
  static async findAll(options = {}) {
    const {
      limit = 50,
      offset = 0,
      categoryId,
      cityId,
      isFeatured,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    let query = `
      SELECT 
        e.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        v.name as venue_name,
        v.address as venue_address,
        v.capacity as venue_capacity,
        ci.name as city_name,
        ci.slug as city_slug
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN cities ci ON v.city_id = ci.id
      WHERE e.status = 'published'
    `;

    const params = [];

    // Filtres
    if (categoryId) {
      query += ' AND e.category_id = ?';
      params.push(categoryId);
    }

    if (cityId) {
      query += ' AND v.city_id = ?';
      params.push(cityId);
    }

    if (isFeatured !== undefined) {
      query += ' AND e.is_featured = ?';
      params.push(isFeatured ? 1 : 0);
    }

    if (search) {
      query += ' AND (e.title LIKE ? OR e.description LIKE ? OR e.short_description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Tri
    const allowedSortFields = ['created_at', 'start_date', 'title', 'interested_count', 'view_count'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY e.${sortField} ${sortDirection}`;

    // Pagination
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const events = await database.all(query, params);

    // Récupérer les types de billets pour chaque événement
    for (const event of events) {
      event.ticket_types = await this.getTicketTypes(event.id);
      
      // Calculer les champs dérivés
      event.is_sold_out = event.total_capacity > 0 && event.sold_tickets >= event.total_capacity;
      event.available_tickets = event.total_capacity - event.sold_tickets;
      event.occupancy_rate = event.total_capacity > 0 ? (event.sold_tickets / event.total_capacity) * 100 : 0;
    }

    return events;
  }

  /**
   * Récupère un événement par son ID
   */
  static async findById(id) {
    const query = `
      SELECT 
        e.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        v.name as venue_name,
        v.address as venue_address,
        v.capacity as venue_capacity,
        ci.name as city_name,
        ci.slug as city_slug
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN cities ci ON v.city_id = ci.id
      WHERE e.id = ?
    `;

    const event = await database.get(query, [id]);

    if (!event) {
      return null;
    }

    // Récupérer les types de billets
    event.ticket_types = await this.getTicketTypes(id);
    
    // Calculer les champs dérivés
    event.is_sold_out = event.total_capacity > 0 && event.sold_tickets >= event.total_capacity;
    event.available_tickets = event.total_capacity - event.sold_tickets;
    event.occupancy_rate = event.total_capacity > 0 ? (event.sold_tickets / event.total_capacity) * 100 : 0;

    return event;
  }

  /**
   * Récupère un événement par son slug
   */
  static async findBySlug(slug) {
    const query = `
      SELECT 
        e.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        v.name as venue_name,
        v.address as venue_address,
        v.capacity as venue_capacity,
        ci.name as city_name,
        ci.slug as city_slug
      FROM events e
      LEFT JOIN categories c ON e.category_id = c.id
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN cities ci ON v.city_id = ci.id
      WHERE e.slug = ? AND e.status = 'published'
    `;

    const event = await database.get(query, [slug]);

    if (!event) {
      return null;
    }

    // Récupérer les types de billets
    event.ticket_types = await this.getTicketTypes(event.id);
    
    // Calculer les champs dérivés
    event.is_sold_out = event.total_capacity > 0 && event.sold_tickets >= event.total_capacity;
    event.available_tickets = event.total_capacity - event.sold_tickets;
    event.occupancy_rate = event.total_capacity > 0 ? (event.sold_tickets / event.total_capacity) * 100 : 0;

    return event;
  }

  /**
   * Récupère les types de billets d'un événement
   */
  static async getTicketTypes(eventId) {
    const ticketTypes = await database.all(
      'SELECT * FROM ticket_types WHERE event_id = ?',
      [eventId]
    );

    return ticketTypes.map(tt => ({
      ...tt,
      available: tt.total_available - tt.sold_tickets,
      is_on_sale: Boolean(tt.is_on_sale)
    }));
  }

  /**
   * Met à jour un événement
   */
  static async update(id, updateData) {
    const allowedFields = [
      'title', 'description', 'short_description', 'category_id',
      'start_date', 'end_date', 'is_free', 'min_price', 'max_price',
      'total_capacity', 'is_featured', 'is_promo', 'status', 'cover_image'
    ];

    const updates = [];
    const params = [];

    // Construire la requête de mise à jour
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(updateData[field]);
      }
    }

    if (updates.length === 0) {
      return false;
    }

    // Ajouter updated_at
    updates.push('updated_at = ?');
    params.push(new Date().toISOString());

    // Ajouter l'ID
    params.push(id);

    const query = `UPDATE events SET ${updates.join(', ')} WHERE id = ?`;
    const result = await database.run(query, params);

    return result.changes > 0;
  }

  /**
   * Supprime un événement
   */
  static async delete(id) {
    const result = await database.run('DELETE FROM events WHERE id = ?', [id]);
    return result.changes > 0;
  }

  /**
   * Compte le nombre total d'événements
   */
  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) as count FROM events WHERE status = ?';
    const params = ['published'];

    if (filters.categoryId) {
      query += ' AND category_id = ?';
      params.push(filters.categoryId);
    }

    if (filters.cityId) {
      query += ' AND venue_id IN (SELECT id FROM venues WHERE city_id = ?)';
      params.push(filters.cityId);
    }

    if (filters.search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const result = await database.get(query, params);
    return result.count;
  }

  /**
   * Incrémente le compteur de vues
   */
  static async incrementViews(id) {
    await database.run('UPDATE events SET view_count = view_count + 1 WHERE id = ?', [id]);
  }

  /**
   * Incrémente le compteur d'intérêt
   */
  static async incrementInterested(id) {
    await database.run('UPDATE events SET interested_count = interested_count + 1 WHERE id = ?', [id]);
  }
}

module.exports = Event;
