/**
 * Contrôleur Événement
 * TogoEvents Backend
 */

const Event = require('../models/Event');
const { validationResult } = require('express-validator');

class EventController {
  /**
   * Récupère tous les événements
   */
  static async getEvents(req, res) {
    try {
      const {
        limit = 20,
        offset = 0,
        categoryId,
        cityId,
        isFeatured,
        search,
        sortBy = 'created_at',
        sortOrder = 'DESC'
      } = req.query;

      // Validation des paramètres
      const options = {
        limit: Math.min(parseInt(limit) || 20, 100), // Maximum 100
        offset: Math.max(parseInt(offset) || 0, 0),
        categoryId,
        cityId,
        isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
        search,
        sortBy,
        sortOrder
      };

      const events = await Event.findAll(options);
      const total = await Event.count({
        categoryId,
        cityId,
        search
      });

      // Headers de pagination
      res.set({
        'X-Total-Count': total.toString(),
        'X-Page-Count': Math.ceil(total / options.limit).toString(),
        'X-Current-Page': Math.floor(options.offset / options.limit) + 1
      });

      res.json({
        success: true,
        data: events,
        pagination: {
          total,
          limit: options.limit,
          offset: options.offset,
          pages: Math.ceil(total / options.limit),
          currentPage: Math.floor(options.offset / options.limit) + 1
        }
      });

    } catch (error) {
      console.error('❌ Erreur getEvents:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la récupération des événements'
      });
    }
  }

  /**
   * Récupère un événement par son ID
   */
  static async getEvent(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'ID de l\'événement requis'
        });
      }

      const event = await Event.findById(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Événement non trouvé'
        });
      }

      // Incrémenter le compteur de vues
      await Event.incrementViews(id);

      res.json({
        success: true,
        data: event
      });

    } catch (error) {
      console.error('❌ Erreur getEvent:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la récupération de l\'événement'
      });
    }
  }

  /**
   * Récupère un événement par son slug
   */
  static async getEventBySlug(req, res) {
    try {
      const { slug } = req.params;

      if (!slug) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Slug de l\'événement requis'
        });
      }

      const event = await Event.findBySlug(slug);

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Événement non trouvé'
        });
      }

      // Incrémenter le compteur de vues
      await Event.incrementViews(event.id);

      res.json({
        success: true,
        data: event
      });

    } catch (error) {
      console.error('❌ Erreur getEventBySlug:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la récupération de l\'événement'
      });
    }
  }

  /**
   * Crée un nouvel événement
   */
  static async createEvent(req, res) {
    try {
      // Validation des erreurs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Erreurs de validation',
          details: errors.array()
        });
      }

      const eventData = req.body;

      // Ajouter l'ID de l'organisateur (si authentifié)
      if (req.user && req.user.id) {
        eventData.organizerId = req.user.id;
      }

      const result = await Event.create(eventData);

      console.log(`✅ Événement créé: ${eventData.title} (${result.id})`);

      res.status(201).json({
        success: true,
        message: 'Événement créé avec succès',
        data: {
          id: result.id,
          slug: result.slug,
          status: 'published'
        }
      });

    } catch (error) {
      console.error('❌ Erreur createEvent:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la création de l\'événement',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Met à jour un événement
   */
  static async updateEvent(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'ID de l\'événement requis'
        });
      }

      // Validation des erreurs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'Erreurs de validation',
          details: errors.array()
        });
      }

      const updateData = req.body;

      // Vérifier que l'événement existe
      const existingEvent = await Event.findById(id);
      if (!existingEvent) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Événement non trouvé'
        });
      }

      // Vérifier les permissions (si l'utilisateur est l'organisateur)
      if (req.user && existingEvent.organizer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Vous n\'êtes pas autorisé à modifier cet événement'
        });
      }

      const success = await Event.update(id, updateData);

      if (!success) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Aucune modification apportée'
        });
      }

      // Récupérer l'événement mis à jour
      const updatedEvent = await Event.findById(id);

      console.log(`✅ Événement mis à jour: ${updatedEvent.title} (${id})`);

      res.json({
        success: true,
        message: 'Événement mis à jour avec succès',
        data: updatedEvent
      });

    } catch (error) {
      console.error('❌ Erreur updateEvent:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la mise à jour de l\'événement'
      });
    }
  }

  /**
   * Supprime un événement
   */
  static async deleteEvent(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'ID de l\'événement requis'
        });
      }

      // Vérifier que l'événement existe
      const existingEvent = await Event.findById(id);
      if (!existingEvent) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Événement non trouvé'
        });
      }

      // Vérifier les permissions (si l'utilisateur est l'organisateur)
      if (req.user && existingEvent.organizer_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Vous n\'êtes pas autorisé à supprimer cet événement'
        });
      }

      const success = await Event.delete(id);

      if (!success) {
        return res.status(500).json({
          success: false,
          error: 'Internal Server Error',
          message: 'Erreur lors de la suppression de l\'événement'
        });
      }

      console.log(`✅ Événement supprimé: ${existingEvent.title} (${id})`);

      res.json({
        success: true,
        message: 'Événement supprimé avec succès'
      });

    } catch (error) {
      console.error('❌ Erreur deleteEvent:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la suppression de l\'événement'
      });
    }
  }

  /**
   * Marque un événement comme intéressant
   */
  static async markInterested(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'ID de l\'événement requis'
        });
      }

      // Vérifier que l'événement existe
      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Not Found',
          message: 'Événement non trouvé'
        });
      }

      await Event.incrementInterested(id);

      res.json({
        success: true,
        message: 'Intérêt marqué avec succès',
        data: {
          interested_count: event.interested_count + 1
        }
      });

    } catch (error) {
      console.error('❌ Erreur markInterested:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors du marquage d\'intérêt'
      });
    }
  }

  /**
   * Recherche d'événements
   */
  static async searchEvents(req, res) {
    try {
      const {
        q: query,
        limit = 20,
        offset = 0,
        categoryId,
        cityId
      } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Bad Request',
          message: 'Requête de recherche (q) requise'
        });
      }

      const options = {
        limit: Math.min(parseInt(limit) || 20, 100),
        offset: Math.max(parseInt(offset) || 0, 0),
        search: query,
        categoryId,
        cityId
      };

      const events = await Event.findAll(options);
      const total = await Event.count({ search: query, categoryId, cityId });

      res.set({
        'X-Total-Count': total.toString(),
        'X-Page-Count': Math.ceil(total / options.limit).toString(),
        'X-Current-Page': Math.floor(options.offset / options.limit) + 1
      });

      res.json({
        success: true,
        data: events,
        pagination: {
          total,
          limit: options.limit,
          offset: options.offset,
          pages: Math.ceil(total / options.limit),
          currentPage: Math.floor(options.offset / options.limit) + 1
        },
        search: {
          query,
          results: events.length
        }
      });

    } catch (error) {
      console.error('❌ Erreur searchEvents:', error);
      res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        message: 'Erreur lors de la recherche d\'événements'
      });
    }
  }
}

module.exports = EventController;
