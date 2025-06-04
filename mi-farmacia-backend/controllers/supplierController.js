
const pool = require('../config/db');

// Obtener todos los proveedores
exports.getAllSuppliers = async (req, res) => {
  try {
    // Seleccionamos solo id y nombre para los desplegables, puedes añadir más campos si los necesitas
    const [rows] = await pool.query('SELECT id, nombre FROM proveedores ORDER BY nombre ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener proveedores.', error: error.message });
  }
};

// Podrías añadir CRUD completo para proveedores aquí si fuera necesario más adelante