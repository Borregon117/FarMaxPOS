// ============== ARCHIVO: server.js ==============
// Archivo principal para configurar y arrancar el servidor Express

require('dotenv').config(); // Carga las variables de entorno desde .env
const express = require('express');
const cors = require('cors');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes'); // Descomentar cuando las tengas
const categoryRoutes = require('./routes/categoryRoutes'); // <-- IMPORTA LAS RUTAS DE CATEGORÍAS
const supplierRoutes = require('./routes/supplierRoutes'); // <-- IMPORTA LAS RUTAS DE PROVEEDORES
const salesRoutes = require('./routes/salesRoutes'); // <-- IMPORTA LAS RUTAS DE VENTAS
const apartadoRoutes = require('./routes/apartadoRoutes'); // <-- 1. IMPORTA LAS RUTAS DE APARTADOS

const app = express();
const PORT = process.env.PORT || 3000; // Usa el puerto de .env o 3000 por defecto

// Middlewares
app.use(cors()); // Habilita CORS para todas las rutas (para desarrollo está bien, en producción puedes configurarlo más restrictivamente)
app.use(express.json()); // Para parsear cuerpos de petición en formato JSON
app.use(express.urlencoded({ extended: true })); // Para parsear cuerpos de petición URL-encoded


// Rutas de la API
app.get('/', (req, res) => { // Una ruta de prueba
  res.send('API del Sistema de Farmacia funcionando!');
});

app.use('/api/auth', authRoutes); // Todas las rutas en authRoutes estarán prefijadas con /api/auth
app.use('/api/productos', productRoutes); // Descomentar cuando tengas rutas de productos
app.use('/api/categorias', categoryRoutes);     // <-- USA LAS RUTAS DE CATEGORÍAS
app.use('/api/proveedores', supplierRoutes);   // <-- USA LAS RUTAS DE PROVEEDORES
app.use('/api/ventas', salesRoutes);
app.use('/api/apartados', apartadoRoutes);     // <-- 2. USA LAS RUTAS DE APARTADOS



// Manejador de errores básico (opcional, pero buena práctica)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('¡Algo salió mal en el servidor!');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

