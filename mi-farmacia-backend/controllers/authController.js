
// ============== ARCHIVO: controllers/authController.js ==============
// Lógica para el manejo de la autenticación

const pool = require('../config/db'); // Importamos el pool de conexiones
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Controlador para el login de empleados
exports.loginEmpleado = async (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
  }

  try {
    // 1. Buscar al empleado por su nombre de usuario
    const [rows] = await pool.query('SELECT * FROM empleados WHERE usuario = ? AND activo = TRUE', [usuario]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas o usuario inactivo.' }); // Usuario no encontrado o inactivo
    }

    const empleado = rows[0];

    // 2. Comparar la contraseña proporcionada con la contraseña hasheada en la BD
    // La contraseña 'admin123' que insertamos como ejemplo en la BD tiene el hash '$2b$10$abcdefghijklmnopqrstuv'
    // Si usaste una contraseña diferente al insertar el admin, bcrypt.compare fallará hasta que
    // registres un empleado con una contraseña hasheada correctamente desde la aplicación.
    // Para pruebas iniciales, podrías comentar la verificación de contraseña o asegurarte que el hash coincida.
    const contrasenaValida = await bcrypt.compare(contrasena, empleado.contrasena_hash);

    if (!contrasenaValida) {
      return res.status(401).json({ message: 'Credenciales inválidas.' }); // Contraseña incorrecta
    }

    // 3. Si las credenciales son correctas, generar un JWT
    const payload = {
      id: empleado.id,
      usuario: empleado.usuario,
      rol_id: empleado.id_rol // Podrías querer el nombre del rol aquí, necesitarías un JOIN
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }); // Token expira en 1 hora

    // Devolver el token y (opcionalmente) algunos datos del empleado
    res.status(200).json({
      message: 'Login exitoso.',
      token,
      empleado: {
        id: empleado.id,
        nombre: empleado.nombre,
        apellidos: empleado.apellidos,
        usuario: empleado.usuario,
        id_rol: empleado.id_rol
      }
    });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};

// (Opcional) Podrías añadir un controlador para registrar empleados aquí en el futuro
// exports.registrarEmpleado = async (req, res) => { ... }