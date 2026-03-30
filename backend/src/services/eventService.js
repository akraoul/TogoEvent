const { getDatabase } = require('../plugins/db');

const getEvents = async () => {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 
      e.*,
      c.name as category_name,
      c.slug as category_slug,
      c.icon as category_icon,
      c.color as category_color,
      o.company_name as organizer_name,
      o.is_verified as organizer_verified,
      v.name as venue_name,
      v.address as venue_address,
      ci.name as city_name,
      ci.slug as city_slug
    FROM events e
    LEFT JOIN categories c ON e.category_id = c.id
    LEFT JOIN organizers o ON e.organizer_id = o.id
    LEFT JOIN venues v ON e.venue_id = v.id
    LEFT JOIN cities ci ON v.city_id = ci.id
    WHERE e.status = 'active'
    ORDER BY e.start_date ASC
  `);
  
  const events = stmt.all();
  
  // Get ticket types for each event
  const eventsWithTickets = events.map(event => {
    const ticketStmt = db.prepare(`
      SELECT * FROM ticket_types 
      WHERE event_id = ? AND is_on_sale = 1
    `);
    const tickets = ticketStmt.all(event.id);
    
    return {
      ...event,
      category: {
        id: event.category_id,
        name: event.category_name,
        slug: event.category_slug,
        icon: event.category_icon,
        color: event.category_color
      },
      organizer: {
        id: event.organizer_id,
        company_name: event.organizer_name,
        is_verified: event.organizer_verified
      },
      venue: {
        id: event.venue_id,
        name: event.venue_name,
        address: event.venue_address,
        city: {
          id: event.city_id,
          name: event.city_name,
          slug: event.city_slug
        }
      },
      ticket_types: tickets
    };
  });
  
  return {
    success: true,
    data: eventsWithTickets,
    total: eventsWithTickets.length
  };
};

const createEvent = async (eventData) => {
  const db = getDatabase();
  const {
    title,
    description,
    short_description,
    category_id,
    organizer_id,
    venue_id,
    start_date,
    end_date,
    is_free,
    image_url,
    ticket_types
  } = eventData;

  // Validation
  if (!title || !category_id || !start_date || !end_date) {
    return {
      success: false,
      error: 'Missing required fields',
      required: ['title', 'category_id', 'start_date', 'end_date']
    };
  }

  // Create event
  const { v4: uuidv4 } = require('uuid');
  const eventId = uuidv4();
  const eventStmt = db.prepare(`
    INSERT INTO events (
      id, title, description, short_description, category_id,
      organizer_id, venue_id, start_date, end_date, is_free,
      image_url, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  eventStmt.run(
    eventId,
    title,
    description || '',
    short_description || '',
    category_id,
    organizer_id || 'default-organizer',
    venue_id || 'default-venue',
    start_date,
    end_date,
    is_free || 0,
    image_url || '',
    'active',
    new Date().toISOString(),
    new Date().toISOString()
  );

  // Create ticket types if provided
  if (ticket_types && Array.isArray(ticket_types)) {
    const ticketStmt = db.prepare(`
      INSERT INTO ticket_types (
        id, event_id, name, description, price, currency,
        total_available, sold_tickets, is_sold_out, is_on_sale, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    ticket_types.forEach(ticket => {
      const ticketId = uuidv4();
      ticketStmt.run(
        ticketId,
        eventId,
        ticket.name,
        ticket.description || '',
        parseFloat(ticket.price) || 0,
        ticket.currency || 'XOF',
        parseInt(ticket.total_available) || 0,
        0,
        false,
        true,
        new Date().toISOString()
      );
    });
  }

  return {
    success: true,
    data: {
      id: eventId,
      message: 'Event created successfully'
    }
  };
};

module.exports = {
  getEvents,
  createEvent
};
