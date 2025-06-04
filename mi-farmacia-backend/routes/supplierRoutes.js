const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// GET /api/proveedores - Obtener todos los proveedores
router.get('/', supplierController.getAllSuppliers);

module.exports = router;