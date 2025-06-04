const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
// Opcional: const authMiddleware = require('../middleware/authMiddleware'); // Para proteger rutas

// POST /api/ventas - Crear una nueva venta
// router.post('/', authMiddleware.verifyToken, salesController.createSale); // Ejemplo con protección
router.post('/', salesController.createSale); // Sin protección por ahora para simplificar

// GET /api/ventas - Obtener historial de ventas
// router.get('/', authMiddleware.verifyToken, salesController.getAllSales); // Ejemplo con protección
router.get('/', salesController.getAllSales);

// GET /api/ventas/:id - Obtener detalle de una venta
// router.get('/:id', authMiddleware.verifyToken, salesController.getSaleDetailById);
router.get('/:id', salesController.getSaleDetailById);


module.exports = router;