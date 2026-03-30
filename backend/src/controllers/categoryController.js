/**
 * Contrôleur Catégorie
 * TogoEvents Backend
 */

const database = require('../config/database');
const { validationResult } = require('express-validator');

class CategoryController {
  /**
   * Récupère toutes les catégories
   */
  static async getCategories(req, res) {
    try {
      const {
        active = true,
        sortBy = 'order_index',
        sortOrder = 'ASC'
      } = req.query;

      let query = 'SELECT * FROM categories';
      const params = [];

      // Filtrer par statut actif
      if (active !== undefined) {
        query += ' WHERE is_active = ?';
        params.push(active === 'true' ? 1 : 0);
      }

      // Tri
      const allowedSortFields = ['name', 'order_index'];
      const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'order_index';
      const sortDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      
      query += ` ORDER BY ${sortField} ${sortDirection}`;

      const categories = await database.all(query, params);

      res.json({
        success: true,
        data: categories,
        count: categories.length
      });

    } catch (error) {
      console.error('❌ Erreur getCategories:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la récupération des catégories'
      });
    }
  }

  /**
   * Récupère une catégorie par son ID
   */
  static async getCategory(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'ID de la catégorie requis'
        });
      }

      const category = await database.get('SELECT * FROM categories WHERE id = ?', [id]);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Catégorie non trouvée'
        });
      }

      res.json({
        success: true,
        data: category
      });

    } catch (error) {
      console.error('❌ Erreur getCategory:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la récupération de la catégorie'
      });
    }
  }

  /**
   * Récupère une catégorie par son slug
   */
  static async getCategoryBySlug(req, res) {
    try {
      const { slug } = req.params;

      if (!slug) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Slug de la catégorie requis'
        });
      }

      const category = await database.get('SELECT * FROM categories WHERE slug = ?', [slug]);

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Catégorie non trouvée'
        });
      }

      res.json({
        success: true,
        data: category
      });

    } catch (error) {
      console.error('❌ Erreur getCategoryBySlug:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la récupération de la catégorie'
      });
    }
  }

  /**
   * Compte le nombre d'événements par catégorie
   */
  static async getCategoryStats(req, res) {
    try {
      const query = `
        SELECT 
          c.*,
          COUNT(e.id) as event_count
        FROM categories c
        LEFT JOIN events e ON c.id = e.category_id AND e.status = 'published'
        WHERE c.is_active = 1
        GROUP BY c.id
        ORDER BY c.order_index, c.name
      `;

      const categories = await database.all(query);

      res.json({
        success: true,
        data: categories.map(cat => ({
          ...cat,
          event_count: parseInt(cat.event_count)
        })),
        count: categories.length
      });

    } catch (error) {
      console.error('❌ Erreur getCategoryStats:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la récupération des statistiques des catégories'
      });
    }
  }
}

module.exports = CategoryController;
