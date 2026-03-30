/**
 * Contrôleur Ville
 * TogoEvents Backend
 */

const database = require('../config/database');
const { validationResult } = require('express-validator');

class CityController {
  /**
   * Récupère toutes les villes
   */
  static async getCities(req, res) {
    try {
      const {
        country,
        limit = 50,
        offset = 0,
        search
      } = req.query;

      let query = 'SELECT * FROM cities';
      const params = [];
      const conditions = [];

      // Filtre par pays
      if (country) {
        conditions.push('country = ?');
        params.push(country.toUpperCase());
      }

      // Recherche
      if (search) {
        conditions.push('(name LIKE ? OR slug LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      // Tri et pagination
      query += ' ORDER BY name ASC';
      query += ' LIMIT ? OFFSET ?';
      params.push(Math.min(parseInt(limit) || 50, 100), Math.max(parseInt(offset) || 0, 0));

      const cities = await database.all(query, params);

      // Compter le total
      let countQuery = 'SELECT COUNT(*) as total FROM cities';
      const countParams = [];
      const countConditions = [];

      if (country) {
        countConditions.push('country = ?');
        countParams.push(country.toUpperCase());
      }

      if (search) {
        countConditions.push('(name LIKE ? OR slug LIKE ?)');
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
        data: cities,
        pagination: {
          total: countResult.total,
          limit: Math.min(parseInt(limit) || 50, 100),
          offset: Math.max(parseInt(offset) || 0, 0),
          pages: Math.ceil(countResult.total / Math.min(parseInt(limit) || 50, 100)),
          currentPage: Math.floor(Math.max(parseInt(offset) || 0, 0) / Math.min(parseInt(limit) || 50, 100)) + 1
        }
      });

    } catch (error) {
      console.error('❌ Erreur getCities:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la récupération des villes'
      });
    }
  }

  /**
   * Récupère une ville par son ID
   */
  static async getCity(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'ID de la ville requis'
        });
      }

      const city = await database.get('SELECT * FROM cities WHERE id = ?', [id]);

      if (!city) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Ville non trouvée'
        });
      }

      res.json({
        success: true,
        data: city
      });

    } catch (error) {
      console.error('❌ Erreur getCity:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la récupération de la ville'
      });
    }
  }

  /**
   * Récupère une ville par son slug
   */
  static async getCityBySlug(req, res) {
    try {
      const { slug } = req.params;

      if (!slug) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Slug de la ville requis'
        });
      }

      const city = await database.get('SELECT * FROM cities WHERE slug = ?', [slug]);

      if (!city) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Ville non trouvée'
        });
      }

      res.json({
        success: true,
        data: city
      });

    } catch (error) {
      console.error('❌ Erreur getCityBySlug:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la récupération de la ville'
      });
    }
  }

  /**
   * Récupère les lieux d'une ville
   */
  static async getCityVenues(req, res) {
    try {
      const { id } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'ID de la ville requis'
        });
      }

      // Vérifier que la ville existe
      const city = await database.get('SELECT * FROM cities WHERE id = ?', [id]);
      if (!city) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Ville non trouvée'
        });
      }

      const query = `
        SELECT 
          v.*,
          COUNT(e.id) as event_count
        FROM venues v
        LEFT JOIN events e ON v.id = e.venue_id AND e.status = 'published'
        WHERE v.city_id = ?
        GROUP BY v.id
        ORDER BY v.name ASC
        LIMIT ? OFFSET ?
      `;

      const venues = await database.all(query, [
        id,
        Math.min(parseInt(limit) || 50, 100),
        Math.max(parseInt(offset) || 0, 0)
      ]);

      // Compter le total
      const totalResult = await database.get(
        'SELECT COUNT(*) as total FROM venues WHERE city_id = ?',
        [id]
      );

      res.json({
        success: true,
        data: {
          city: city,
          venues: venues.map(venue => ({
            ...venue,
            event_count: parseInt(venue.event_count)
          }))
        },
        pagination: {
          total: totalResult.total,
          limit: Math.min(parseInt(limit) || 50, 100),
          offset: Math.max(parseInt(offset) || 0, 0),
          pages: Math.ceil(totalResult.total / Math.min(parseInt(limit) || 50, 100)),
          currentPage: Math.floor(Math.max(parseInt(offset) || 0, 0) / Math.min(parseInt(limit) || 50, 100)) + 1
        }
      });

    } catch (error) {
      console.error('❌ Erreur getCityVenues:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la récupération des lieux de la ville'
      });
    }
  }

  /**
   * Récupère les événements d'une ville
   */
  static async getCityEvents(req, res) {
    try {
      const { id } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'ID de la ville requis'
        });
      }

      // Vérifier que la ville existe
      const city = await database.get('SELECT * FROM cities WHERE id = ?', [id]);
      if (!city) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Ville non trouvée'
        });
      }

      const query = `
        SELECT 
          e.*,
          c.name as category_name,
          c.icon as category_icon,
          c.color as category_color,
          v.name as venue_name,
          v.address as venue_address
        FROM events e
        LEFT JOIN categories c ON e.category_id = c.id
        LEFT JOIN venues v ON e.venue_id = v.id
        WHERE e.status = 'published' AND v.city_id = ?
        ORDER BY e.start_date ASC
        LIMIT ? OFFSET ?
      `;

      const events = await database.all(query, [
        id,
        Math.min(parseInt(limit) || 20, 100),
        Math.max(parseInt(offset) || 0, 0)
      ]);

      // Compter le total
      const totalResult = await database.get(`
        SELECT COUNT(*) as total
        FROM events e
        LEFT JOIN venues v ON e.venue_id = v.id
        WHERE e.status = 'published' AND v.city_id = ?
      `, [id]);

      res.json({
        success: true,
        data: {
          city: city,
          events: events
        },
        pagination: {
          total: totalResult.total,
          limit: Math.min(parseInt(limit) || 20, 100),
          offset: Math.max(parseInt(offset) || 0, 0),
          pages: Math.ceil(totalResult.total / Math.min(parseInt(limit) || 20, 100)),
          currentPage: Math.floor(Math.max(parseInt(offset) || 0, 0) / Math.min(parseInt(limit) || 20, 100)) + 1
        }
      });

    } catch (error) {
      console.error('❌ Erreur getCityEvents:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la récupération des événements de la ville'
      });
    }
  }

  /**
   * Récupère les statistiques des villes
   */
  static async getCityStats(req, res) {
    try {
      const query = `
        SELECT 
          c.*,
          COUNT(v.id) as venue_count,
          COUNT(e.id) as event_count,
          COUNT(DISTINCT e.category_id) as category_count
        FROM cities c
        LEFT JOIN venues v ON c.id = v.city_id
        LEFT JOIN events e ON v.id = e.venue_id AND e.status = 'published'
        GROUP BY c.id
        ORDER BY event_count DESC, c.name ASC
      `;

      const cities = await database.all(query);

      res.json({
        success: true,
        data: cities.map(city => ({
          ...city,
          venue_count: parseInt(city.venue_count),
          event_count: parseInt(city.event_count),
          category_count: parseInt(city.category_count)
        })),
        count: cities.length
      });

    } catch (error) {
      console.error('❌ Erreur getCityStats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la récupération des statistiques des villes'
      });
    }
  }
}

module.exports = CityController;
