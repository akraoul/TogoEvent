/**
 * Routes Événements
 * TogoEvents Backend
 */

const express = require('express');
const { body, param, query } = require('express-validator');
const EventController = require('../controllers/eventController');
const { routeSecurity } = require('../config/security');

const router = express.Router();

/**
 * Validation pour la création d'événement
 */
const createEventValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le titre doit contenir entre 3 et 200 caractères'),
  
  body('categoryId')
    .notEmpty()
    .withMessage('La catégorie est requise')
    .isUUID()
    .withMessage('L\'ID de catégorie doit être un UUID valide'),
  
  body('venueName')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le nom du lieu doit contenir entre 3 et 200 caractères'),
  
  body('venueAddress')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('L\'adresse du lieu doit contenir entre 5 et 500 caractères'),
  
  body('startDate')
    .isISO8601()
    .withMessage('La date de début doit être une date valide'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('La date de fin doit être une date valide'),
  
  body('isFree')
    .optional()
    .isBoolean()
    .withMessage('isFree doit être un booléen'),
  
  body('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix minimum doit être supérieur ou égal à 0'),
  
  body('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix maximum doit être supérieur ou égal à 0'),
  
  body('totalCapacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La capacité totale doit être supérieure à 0'),
  
  body('ticketTypes')
    .optional()
    .isArray()
    .withMessage('Les types de billets doivent être un tableau'),
  
  body('ticketTypes.*.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Le nom du type de billet doit contenir entre 1 et 100 caractères'),
  
  body('ticketTypes.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix du billet doit être supérieur ou égal à 0'),
  
  body('ticketTypes.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La quantité de billets doit être supérieure à 0'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured doit être un booléen'),
  
  body('isPromo')
    .optional()
    .isBoolean()
    .withMessage('isPromo doit être un booléen'),
  
  body('coverImage')
    .optional()
    .isURL()
    .withMessage('L\'image de couverture doit être une URL valide')
];

/**
 * Validation pour la mise à jour d'événement
 */
const updateEventValidation = [
  param('id')
    .isUUID()
    .withMessage('L\'ID de l\'événement doit être un UUID valide'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Le titre doit contenir entre 3 et 200 caractères'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('La description ne doit pas dépasser 5000 caractères'),
  
  body('shortDescription')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La description courte ne doit pas dépasser 500 caractères'),
  
  body('categoryId')
    .optional()
    .isUUID()
    .withMessage('L\'ID de catégorie doit être un UUID valide'),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('La date de début doit être une date valide'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('La date de fin doit être une date valide'),
  
  body('isFree')
    .optional()
    .isBoolean()
    .withMessage('isFree doit être un booléen'),
  
  body('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix minimum doit être supérieur ou égal à 0'),
  
  body('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix maximum doit être supérieur ou égal à 0'),
  
  body('totalCapacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La capacité totale doit être supérieure à 0'),
  
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured doit être un booléen'),
  
  body('isPromo')
    .optional()
    .isBoolean()
    .withMessage('isPromo doit être un booléen'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published', 'cancelled', 'postponed'])
    .withMessage('Le statut doit être l\'une des valeurs suivantes: draft, published, cancelled, postponed')
];

/**
 * Validation pour les paramètres de requête
 */
const queryValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('L\'offset doit être supérieur ou égal à 0'),
  
  query('categoryId')
    .optional()
    .isUUID()
    .withMessage('L\'ID de catégorie doit être un UUID valide'),
  
  query('cityId')
    .optional()
    .isUUID()
    .withMessage('L\'ID de ville doit être un UUID valide'),
  
  query('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured doit être un booléen'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('La recherche doit contenir entre 1 et 100 caractères'),
  
  query('sortBy')
    .optional()
    .isIn(['created_at', 'start_date', 'title', 'interested_count', 'view_count'])
    .withMessage('Le tri doit être l\'une des valeurs suivantes: created_at, start_date, title, interested_count, view_count'),
  
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('L\'ordre de tri doit être ASC ou DESC')
];

/**
 * Validation pour les paramètres ID/Slug
 */
const paramValidation = [
  param('id')
    .isUUID()
    .withMessage('L\'ID doit être un UUID valide')
];

const slugValidation = [
  param('slug')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Le slug doit contenir entre 1 et 200 caractères')
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Le slug ne peut contenir que des lettres minuscules, des chiffres et des tirets')
];

/**
 * Routes
 */

// GET /api/events - Lister tous les événements
router.get('/', queryValidation, EventController.getEvents);

// GET /api/events/search - Rechercher des événements
router.get('/search', [
  query('q')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('La recherche doit contenir entre 1 et 100 caractères'),
  ...queryValidation
], EventController.searchEvents);

// GET /api/events/:id - Récupérer un événement par ID
router.get('/:id', paramValidation, EventController.getEvent);

// GET /api/events/slug/:slug - Récupérer un événement par slug
router.get('/slug/:slug', slugValidation, EventController.getEventBySlug);

// POST /api/events - Créer un nouvel événement
router.post('/', routeSecurity.createEvent, createEventValidation, EventController.createEvent);

// PUT /api/events/:id - Mettre à jour un événement
router.put('/:id', paramValidation, updateEventValidation, EventController.updateEvent);

// DELETE /api/events/:id - Supprimer un événement
router.delete('/:id', paramValidation, EventController.deleteEvent);

// POST /api/events/:id/interested - Marquer comme intéressé
router.post('/:id/interested', paramValidation, EventController.markInterested);

module.exports = router;
