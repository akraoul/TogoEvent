/**
 * Contrôleur Lieu
 * TogoEvents Backend
 */

const database = require('../config/database');
const { validationResult } = require('express-validator');

class VenueController {
  /**
   * Récupère tous les lieux
   */
  static async getVenues(req, res) {
    try {
      const {
        city_id,
        limit = 50,
        offset = 0,
        search
      } = req.query;

      let query = `
        SELECT 
          v.*,
          c.name as city_name,
          c.slug as city_slug,
          c.country as city_country
        FROM venues v
        LEFT JOIN cities c ON v.city_id = c.id
      `;
      
      const params = [];
      const conditions = [];

      // Filtre par ville
      if (city_id) {
        conditions.push('v.city_id = ?');
        params.push(city_id);
      }

      // Recherche
      if (search) {
        conditions.push('(v.name LIKE ? OR v.address LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      // Tri et pagination
      query += ' ORDER BY v.name ASC';
      query += ' LIMIT ? OFFSET ?';
      params.push(Math.min(parseInt(limit) || 50, 100), Math.max(parseInt(offset) || 0, 0));

      const venues = await database.all(query, params);

      // Compter le total
      let countQuery = `
        SELECT COUNT(*) as total
        FROM venues v
      `;
      const countParams = [];
      const countConditions = [];

      if (city_id) {
        countConditions.push('v.city_id = ?');
        countParams.push(city_id);
      }

      if (search) {
        countConditions.push('(v.name LIKE ? OR v.address LIKE ?)');
        countParams.push(`%${search}%`, `%${search}%`);
      }

      if (countConditions.length > 0) {
        countQuery += ' WHERE ' + countConditions.join(' AND ');
      }

      const countResult = await database.get(countQuery, countParams);

      res.set({
        'X-Total-Count': countResult.total.toString(),
        'X-Page-Count': Math.ceil(countResult.total / Math.min(parseInt(limit) || 50, 100)).toString(),
        'X-Current-Page': Math.floor(Math.max(parseInt(offset) || 0, 0) / Math.min(parseInt(limit) || 50, 100)) + 1
      });

      res.json({
        success: true,
        data: venues,
        pagination: {
          total: countResult.total,
          limit: Math.min(parseInt(limit) || 50, 100),
          offset: Math.max(parseInt(offset) || 0, 0),
          pages: Math.ceil(countResult.total / Math.min(parseInt(limit) || 50, 100)),
          currentPage: Math.floor(Math.max(parseInt(offset) || 0, 0) / Math.min(parseInt(limit) || 50, 100)) + 1
        }
      });

    } catch (error) {
      console.error('❌ Erreur getVenues:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la récupération des lieux'
      });
    }
  }

  /**
   * Récupère un lieu par son ID
   */
  static async getVenue(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'ID du lieu requis'
        });
      }

      const query = `
        SELECT 
          v.*,
          c.name as city_name,
          c.slug as city_slug,
          c.country as city_country
        FROM venues v
        LEFT JOIN cities c ON v.city_id = c.id
        WHERE v.id = ?
      `;

      const venue = await database.get(query, [id]);

      if (!venue) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Lieu non trouvé'
        });
      }

      // Récupérer les événements à venir dans ce lieu
      const eventsQuery = `
        SELECT 
          id, title, slug, start_date, end_date, is_featured, status
        FROM events
        WHERE venue_id = ? AND status = 'published' AND start_date > datetime('now')
        ORDER BY start_date ASC
        LIMIT 10
      `;

      const upcomingEvents = await database.all(eventsQuery, [id]);

      res.json({
        success: true,
        data: {
          ...venue,
          upcoming_events: upcomingEvents,
          upcoming_events_count: upcomingEvents.length
        }
      });

    } catch (error) {
      console.error('❌ Erreur getVenue:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la récupération du lieu'
      });
    }
  }

  /**
   * Récupère les lieux par ville
   */
  static async getVenuesByCity(req, res) {
    try {
      const { cityId } = req.params;
      const { limit = 50, offset = 0, search } = req.query;

      if (!cityId) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'ID de la ville requis'
        });
      }

      // Vérifier que la ville existe
      const city = await database.get('SELECT * FROM cities WHERE id = ?', [cityId]);
      if (!city) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Ville non trouvée'
        });
      }

      let query = `
        SELECT 
          v.*,
          c.name as city_name,
          c.slug as city_slug,
          c.country as city_country
        FROM venues v
        LEFT JOIN cities c ON v.city_id = c.id
        WHERE v.city_id = ?
      `;
      
      const params = [cityId];

      // Recherche
      if (search) {
        query += ' AND (v.name LIKE ? OR v.address LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      // Tri et pagination
      query += ' ORDER BY v.name ASC';
      query += ' LIMIT ? OFFSET ?';
      params.push(Math.min(parseInt(limit) || 50, 100), Math.max(parseInt(offset) || 0, 0));

      const venues = await database.all(query, params);

      // Compter le total
      let countQuery = 'SELECT COUNT(*) as total FROM venues WHERE city_id = ?';
      const countParams = [cityId];

      if (search) {
        countQuery += ' AND (name LIKE ? OR address LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`);
      }

      const countResult = await database.get(countQuery, countParams);

      res.set({
        'X-Total-Count': countResult.total.toString(),
        'X-Page-Count': Math.ceil(countResult.total / Math.min(parseInt(limit) || 50, 100)).toString(),
        'X-Current-Page': Math.floor(Math.max(parseInt(offset) || 0, 0) / Math.min(parseInt(limit) || 50, 100)) + 1
      });

      res.json({
        success: true,
        data: {
          city: city,
          venues: venues
        },
        pagination: {
          total: countResult.total,
          limit: Math.min(parseInt(limit) || 50, 100),
          offset: Math.max(parseInt(offset) || 0, 0),
          pages: Math.ceil(countResult.total / Math.min(parseInt(limit) || 50, 100)),
          currentPage: Math.floor(Math.max(parseInt(offset) || 0, 0) / Math.min(parseInt(limit) || 50, 100)) + 1
        }
      });

    } catch (error) {
      console.error('❌ Erreur getVenuesByCity:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la récupération des lieux de la ville'
      });
    }
  }

  /**
   * Récupère les statistiques des lieux
   */
  static async getVenueStats(req, res) {
    try {
      const query = `
        SELECT 
          v.*,
          c.name as city_name,
          c.slug as city_slug,
          COUNT(e.id) as event_count,
          MAX(e.start_date) as next_event_date
        FROM venues v
        LEFT JOIN cities c ON v.city_id = c.id
        LEFT JOIN events e ON v.id = e.venue_id AND e.status = 'published'
        GROUP BY v.id
        ORDER BY event_count DESC, v.name ASC
      `;

      const venues = await database.all(query);

      res.json({
        success: true,
        data: venues.map(venue => ({
          ...venue,
          event_count: parseInt(venue.event_count),
          has_upcoming_events: venue.next_event_date && new Date(venue.next_event_date) > new Date()
        })),
        count: venues.length
      });

    } catch (error) {
      console.error('❌ Erreur getVenueStats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la récupération des statistiques des lieux'
      });
    }
  }
}

module.exports = VenueController;
