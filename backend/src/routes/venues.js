/**
 * Routes Lieux
 * TogoEvents Backend
 */

const express = require('express');
const { query, param } = require('express-validator');
const VenueController = require('../controllers/venueController');

const router = express.Router();

/**
 * Validation pour les paramètres de requête
 */
const queryValidation = [
  query('city_id')
    .optional()
    .isUUID()
    .withMessage('L\'ID de ville doit être un UUID valide'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('L\'offset doit être supérieur ou égal à 0'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('La recherche doit contenir entre 1 et 100 caractères')
];

/**
 * Validation pour les paramètres ID
 */
const paramValidation = [
  param('id')
    .isUUID()
    .withMessage('L\'ID doit être un UUID valide')
];

/**
 * GET /api/venues - Lister tous les lieux
 */
router.get('/', queryValidation, VenueController.getVenues);

/**
 * GET /api/venues/:id - Récupérer un lieu par ID
 */
router.get('/:id', paramValidation, VenueController.getVenue);

/**
 * GET /api/venues/city/:cityId - Lister les lieux par ville
 */
router.get('/city/:cityId', [
  param('cityId')
    .isUUID()
    .withMessage('L\'ID de ville doit être un UUID valide'),
  ...queryValidation
], VenueController.getVenuesByCity);

module.exports = router;
