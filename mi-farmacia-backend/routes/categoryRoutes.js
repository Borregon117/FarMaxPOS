const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// GET /api/categorias - Obtener todas las categorías
router.get('/', categoryController.getAllCategories);

module.exports = router;