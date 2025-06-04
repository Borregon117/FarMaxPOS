const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
// Opcional: Importar middleware de autenticación/autorización si se requiere
// const authMiddleware = require('../middleware/authMiddleware'); // Ejemplo

// Definición de rutas para productos
// GET /api/productos - Obtener todos los productos
router.get('/', productController.getAllProducts);

// GET /api/productos/:id - Obtener un producto por ID
router.get('/:id', productController.getProductById);

// POST /api/productos - Crear un nuevo producto
// Podrías proteger esta ruta para que solo administradores puedan crear productos
// router.post('/', authMiddleware.verifyToken, authMiddleware.isAdmin, productController.createProduct);
router.post('/', productController.createProduct); // Sin protección por ahora para simplificar

// PUT /api/productos/:id - Actualizar un producto existente
// router.put('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, productController.updateProduct);
router.put('/:id', productController.updateProduct); // Sin protección por ahora

// DELETE /api/productos/:id - Eliminar un producto
// router.delete('/:id', authMiddleware.verifyToken, authMiddleware.isAdmin, productController.deleteProduct);
router.delete('/:id', productController.deleteProduct); // Sin protección por ahora

module.exports = router;