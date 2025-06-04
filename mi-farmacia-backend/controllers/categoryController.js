
const pool = require('../config/db');

// Obtener todas las categorías
exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre FROM categorias ORDER BY nombre ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener categorías.', error: error.message });
  }
};

// Podrías añadir CRUD completo para categorías aquí si fuera necesario más adelante
// exports.createCategory = async (req, res) => { ... };
// exports.updateCategory = async (req, res) => { ... };
// exports.deleteCategory = async (req, res) => { ... };