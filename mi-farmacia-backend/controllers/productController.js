// ============== ARCHIVO: mi-farmacia-backend/controllers/productController.js ==============

const pool = require('../config/db'); // Tu pool de conexiones a MySQL

// Obtener todos los productos
exports.getAllProducts = async (req, res) => {
  try {
    // Podrías añadir JOINs aquí para obtener nombres de categoría y proveedor en el futuro
    const [rows] = await pool.query('SELECT * FROM productos ORDER BY nombre ASC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener productos.', error: error.message });
  }
};

// Obtener un producto por su ID
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(`Error al obtener el producto ${id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor al obtener el producto.', error: error.message });
  }
};

// Crear un nuevo producto
exports.createProduct = async (req, res) => {
  // Extraer todos los campos de la tabla 'productos' del ERS
  const {
    codigo_barras,
    nombre,
    descripcion,
    precio_venta,
    costo_compra, // Puede ser NULL
    stock_actual,
    stock_minimo,
    // stock_apartado se maneja por lógica de apartados, usualmente no se setea al crear producto directamente. Default 0.
    fecha_caducidad, // Puede ser NULL
    id_categoria,
    id_proveedor_preferido, // Puede ser NULL
    requiere_receta
  } = req.body;

  // Validación básica (puedes expandirla mucho más)
  if (!codigo_barras || !nombre || precio_venta === undefined || stock_actual === undefined || stock_minimo === undefined || id_categoria === undefined) {
    return res.status(400).json({ message: 'Campos requeridos faltantes: codigo_barras, nombre, precio_venta, stock_actual, stock_minimo, id_categoria.' });
  }

  const nuevoProducto = {
    codigo_barras,
    nombre,
    descripcion: descripcion || null,
    precio_venta,
    costo_compra: costo_compra !== undefined ? costo_compra : null,
    stock_actual,
    stock_minimo,
    stock_apartado: 0, // Inicialmente 0
    fecha_caducidad: fecha_caducidad || null,
    id_categoria,
    id_proveedor_preferido: id_proveedor_preferido !== undefined ? id_proveedor_preferido : null,
    requiere_receta: requiere_receta || false,
  };

  try {
    const [result] = await pool.query('INSERT INTO productos SET ?', [nuevoProducto]);
    res.status(201).json({ message: 'Producto creado exitosamente.', id: result.insertId, ...nuevoProducto });
  } catch (error) {
    console.error('Error al crear producto:', error);
    // Manejar error de código de barras duplicado (ER_DUP_ENTRY - 1062)
    if (error.code === 'ER_DUP_ENTRY' && error.sqlMessage.includes('codigo_barras_UNIQUE')) {
        return res.status(409).json({ message: 'Error: El código de barras ya existe.', field: 'codigo_barras' });
    }
    res.status(500).json({ message: 'Error interno del servidor al crear el producto.', error: error.message });
  }
};

// Actualizar un producto existente
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  // Extraer campos actualizables. No se debería poder cambiar el 'id' ni 'codigo_barras' fácilmente (o con otra ruta).
  // No se actualiza stock_apartado directamente aquí.
  const {
    nombre,
    descripcion,
    precio_venta,
    costo_compra,
    stock_actual,
    stock_minimo,
    fecha_caducidad,
    id_categoria,
    id_proveedor_preferido,
    requiere_receta
  } = req.body;

  // Crear un objeto con solo los campos que se enviaron para actualizar
  const camposAActualizar = {};
  if (nombre !== undefined) camposAActualizar.nombre = nombre;
  if (descripcion !== undefined) camposAActualizar.descripcion = descripcion;
  if (precio_venta !== undefined) camposAActualizar.precio_venta = precio_venta;
  if (costo_compra !== undefined) camposAActualizar.costo_compra = costo_compra;
  if (stock_actual !== undefined) camposAActualizar.stock_actual = stock_actual; // Considerar si esto se actualiza por ventas/recepciones
  if (stock_minimo !== undefined) camposAActualizar.stock_minimo = stock_minimo;
  if (fecha_caducidad !== undefined) camposAActualizar.fecha_caducidad = fecha_caducidad;
  if (id_categoria !== undefined) camposAActualizar.id_categoria = id_categoria;
  if (id_proveedor_preferido !== undefined) camposAActualizar.id_proveedor_preferido = id_proveedor_preferido;
  if (requiere_receta !== undefined) camposAActualizar.requiere_receta = requiere_receta;


  if (Object.keys(camposAActualizar).length === 0) {
    return res.status(400).json({ message: 'No se proporcionaron datos para actualizar.' });
  }

  try {
    const [result] = await pool.query('UPDATE productos SET ? WHERE id = ?', [camposAActualizar, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado para actualizar.' });
    }
    // Obtener el producto actualizado para devolverlo (opcional pero buena práctica)
    const [updatedProductRows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
    res.status(200).json({ message: 'Producto actualizado exitosamente.', producto: updatedProductRows[0] });
  } catch (error) {
    console.error(`Error al actualizar el producto ${id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor al actualizar el producto.', error: error.message });
  }
};

// Eliminar un producto
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    // Antes de eliminar, podrías verificar si el producto está en ventas_detalle, apartados_detalle, etc.
    // y decidir si permitir la eliminación o no (por las restricciones FK ON DELETE RESTRICT).
    // Por ahora, intentaremos eliminar directamente. Si hay FKs, la BD lo impedirá.
    const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado para eliminar.' });
    }
    res.status(200).json({ message: 'Producto eliminado exitosamente.' }); // O 204 No Content
  } catch (error) {
    console.error(`Error al eliminar el producto ${id}:`, error);
    // Manejar error de restricción de clave foránea (si el producto no se puede eliminar)
    if (error.code === 'ER_ROW_IS_REFERENCED_2') { // Código de error común para FK constraint
        return res.status(409).json({ message: 'Error: El producto no se puede eliminar porque está referenciado en otras tablas (ventas, apartados, etc.).' });
    }
    res.status(500).json({ message: 'Error interno del servidor al eliminar el producto.', error: error.message });
  }
};