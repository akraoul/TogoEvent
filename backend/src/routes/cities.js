/**
 * Routes Villes
 * TogoEvents Backend
 */

const express = require('express');
const { query, param } = require('express-validator');
const CityController = require('../controllers/cityController');

const router = express.Router();

/**
 * Validation pour les paramètres de requête
 */
const queryValidation = [
  query('country')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('Le code pays doit contenir 2 caractères'),
  
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
 * GET /api/cities - Lister toutes les villes
 */
router.get('/', queryValidation, CityController.getCities);

/**
 * GET /api/cities/:id - Récupérer une ville par ID
 */
router.get('/:id', paramValidation, CityController.getCity);

/**
 * GET /api/cities/:id/venues - Lister les lieux d'une ville
 */
router.get('/:id/venues', paramValidation, CityController.getCityVenues);

/**
 * GET /api/cities/:id/events - Lister les événements d'une ville
 */
router.get('/:id/events', [
  param('id')
    .isUUID()
    .withMessage('L\'ID doit être un UUID valide'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('L\'offset doit être supérieur ou égal à 0')
], CityController.getCityEvents);

module.exports = router;
