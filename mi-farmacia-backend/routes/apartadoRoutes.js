const express = require('express');
const router = express.Router();
const apartadoController = require('../controllers/apartadoController');
// const authMiddleware = require('../middleware/authMiddleware'); // Para proteger rutas

// POST /api/apartados - Crear un nuevo apartado
// router.post('/', authMiddleware.verifyToken, apartadoController.createApartado);
router.post('/', apartadoController.createApartado);

// GET /api/apartados - Listar todos los apartados
// router.get('/', authMiddleware.verifyToken, apartadoController.getAllApartados);
router.get('/', apartadoController.getAllApartados);

// GET /api/apartados/:id - Obtener detalle de un apartado
// router.get('/:id', authMiddleware.verifyToken, apartadoController.getApartadoDetailById);
router.get('/:id', apartadoController.getApartadoDetailById);

// PUT /api/apartados/:id/estado - Actualizar el estado de un apartado
// router.put('/:id/estado', authMiddleware.verifyToken, apartadoController.updateApartadoStatus);
router.put('/:id/estado', apartadoController.updateApartadoStatus);


module.exports = router;