const pool = require('../config/db'); // Tu pool de conexiones a MySQL

// Crear una nueva venta
exports.createSale = async (req, res) => {
  const { metodo_pago, id_empleado, id_cliente, items } = req.body; // items es un array de { id_producto, cantidad, precio_unitario }

  // Validación básica de entrada
  if (!metodo_pago || !id_empleado || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Datos incompletos para procesar la venta. Se requiere metodo_pago, id_empleado y al menos un item.' });
  }

  let connection; // Definir la conexión fuera del try para poder usarla en el catch para rollback

  try {
    connection = await pool.getConnection(); // Obtener una conexión del pool
    await connection.beginTransaction(); // Iniciar transacción

    // 1. Calcular el total de la venta y verificar stock
    let totalVenta = 0;
    for (const item of items) {
      if (!item.id_producto || !item.cantidad || item.cantidad <= 0 || !item.precio_unitario || item.precio_unitario < 0) {
        await connection.rollback(); // Revertir transacción
        connection.release();
        return res.status(400).json({ message: `Datos inválidos para el producto ID ${item.id_producto}. Cantidad y precio_unitario son requeridos y deben ser positivos.` });
      }

      // Verificar stock del producto (FOR UPDATE para bloquear la fila y evitar condiciones de carrera)
      const [productRows] = await connection.query('SELECT nombre, stock_actual FROM productos WHERE id = ? FOR UPDATE', [item.id_producto]);
      if (productRows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: `Producto con ID ${item.id_producto} no encontrado.` });
      }
      const producto = productRows[0];
      if (producto.stock_actual < item.cantidad) {
        await connection.rollback();
        connection.release();
        return res.status(409).json({ message: `Stock insuficiente para el producto "${producto.nombre}" (ID: ${item.id_producto}). Stock disponible: ${producto.stock_actual}.` });
      }
      totalVenta += item.cantidad * item.precio_unitario;
    }

    // 2. Insertar en la tabla 'ventas'
    // Generar un folio de ticket único (ejemplo simple, podrías querer algo más robusto)
    const folioTicket = `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const ventaData = {
      fecha_hora: new Date(),
      total: totalVenta,
      metodo_pago,
      id_empleado,
      id_cliente: id_cliente || null, // id_cliente puede ser opcional
      folio_ticket: folioTicket
    };

    const [ventaResult] = await connection.query('INSERT INTO ventas SET ?', [ventaData]);
    const idVenta = ventaResult.insertId;

    // 3. Insertar en 'ventas_detalle' y actualizar stock en 'productos'
    for (const item of items) {
      const detalleData = {
        id_venta: idVenta,
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.cantidad * item.precio_unitario
      };
      await connection.query('INSERT INTO ventas_detalle SET ?', [detalleData]);

      // Actualizar stock del producto
      await connection.query(
        'UPDATE productos SET stock_actual = stock_actual - ? WHERE id = ?',
        [item.cantidad, item.id_producto]
      );
    }

    await connection.commit(); // Confirmar transacción
    connection.release(); // Liberar la conexión de vuelta al pool

    res.status(201).json({
      message: 'Venta creada exitosamente.',
      id_venta: idVenta,
      folio_ticket: folioTicket,
      total_venta: totalVenta
    });

  } catch (error) {
    console.error('Error al crear la venta:', error);
    if (connection) {
      await connection.rollback(); // Revertir transacción en caso de error
      connection.release(); // Liberar la conexión
    }
    res.status(500).json({ message: 'Error interno del servidor al crear la venta.', error: error.message });
  }
};

// Obtener todas las ventas (historial)
exports.getAllSales = async (req, res) => {
  try {
    // Consulta para obtener ventas con nombre de empleado y cliente (si existe)
    // Ordenar por fecha descendente para ver las más recientes primero
    const query = `
      SELECT 
        v.id, 
        v.fecha_hora, 
        v.total, 
        v.metodo_pago, 
        v.folio_ticket,
        e.nombre AS nombre_empleado, 
        e.apellidos AS apellidos_empleado,
        c.nombre AS nombre_cliente,
        c.apellidos AS apellidos_cliente
      FROM ventas v
      JOIN empleados e ON v.id_empleado = e.id
      LEFT JOIN clientes c ON v.id_cliente = c.id 
      ORDER BY v.fecha_hora DESC
    `;
    // Podrías añadir paginación aquí en el futuro
    const [rows] = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener el historial de ventas:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener el historial de ventas.', error: error.message });
  }
};

// Obtener el detalle de una venta específica (opcional por ahora, pero útil)
exports.getSaleDetailById = async (req, res) => {
    const { id } = req.params;
    try {
        // Obtener datos de la venta
        const saleQuery = `
            SELECT 
                v.id, v.fecha_hora, v.total, v.metodo_pago, v.folio_ticket,
                e.nombre AS nombre_empleado, e.apellidos AS apellidos_empleado,
                c.nombre AS nombre_cliente, c.apellidos AS apellidos_cliente
            FROM ventas v
            JOIN empleados e ON v.id_empleado = e.id
            LEFT JOIN clientes c ON v.id_cliente = c.id
            WHERE v.id = ?
        `;
        const [saleRows] = await pool.query(saleQuery, [id]);

        if (saleRows.length === 0) {
            return res.status(404).json({ message: 'Venta no encontrada.' });
        }

        // Obtener detalles de los productos de la venta
        const detailQuery = `
            SELECT 
                vd.id_producto,
                p.nombre AS nombre_producto,
                p.codigo_barras,
                vd.cantidad,
                vd.precio_unitario,
                vd.subtotal
            FROM ventas_detalle vd
            JOIN productos p ON vd.id_producto = p.id
            WHERE vd.id_venta = ?
        `;
        const [detailRows] = await pool.query(detailQuery, [id]);

        res.status(200).json({
            venta: saleRows[0],
            detalles: detailRows
        });

    } catch (error) {
        console.error(`Error al obtener el detalle de la venta ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al obtener el detalle de la venta.', error: error.message });
    }
};