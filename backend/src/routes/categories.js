/**
 * Routes Catégories
 * TogoEvents Backend
 */

const express = require('express');
const { query } = require('express-validator');
const CategoryController = require('../controllers/categoryController');

const router = express.Router();

/**
 * Validation pour les paramètres de requête
 */
const queryValidation = [
  query('active')
    .optional()
    .isBoolean()
    .withMessage('active doit être un booléen'),
  
  query('sortBy')
    .optional()
    .isIn(['name', 'order_index'])
    .withMessage('Le tri doit être name ou order_index'),
  
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('L\'ordre de tri doit être ASC ou DESC')
];

/**
 * GET /api/categories - Lister toutes les catégories
 */
router.get('/', queryValidation, CategoryController.getCategories);

/**
 * GET /api/categories/:id - Récupérer une catégorie par ID
 */
router.get('/:id', CategoryController.getCategory);

module.exports = router;
