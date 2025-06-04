const pool = require('../config/db');

// Crear un nuevo apartado
exports.createApartado = async (req, res) => {
  const { id_empleado, id_cliente, fecha_vencimiento, notas, items } = req.body;

  if (!id_empleado || !fecha_vencimiento || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Datos incompletos. Se requiere id_empleado, fecha_vencimiento y al menos un producto.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    let totalApartadoCalculado = 0;

    for (const item of items) {
      if (!item.id_producto || !item.cantidad || item.cantidad <= 0 || !item.precio_unitario_apartado || item.precio_unitario_apartado < 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: `Datos inválidos para el producto ID ${item.id_producto} en el apartado.` });
      }

      const [productRows] = await connection.query('SELECT nombre, stock_actual, stock_apartado FROM productos WHERE id = ? FOR UPDATE', [item.id_producto]);
      if (productRows.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: `Producto con ID ${item.id_producto} no encontrado.` });
      }
      const producto = productRows[0];

      if (producto.stock_actual < item.cantidad) {
        await connection.rollback();
        connection.release();
        return res.status(409).json({ message: `Stock insuficiente para apartar "${producto.nombre}" (ID: ${item.id_producto}). Disponible: ${producto.stock_actual}.` });
      }

      // ESTA ES LA ACTUALIZACIÓN CRÍTICA AL CREAR APARTADO
      const updateStockQuery = 'UPDATE productos SET stock_actual = stock_actual - ?, stock_apartado = stock_apartado + ? WHERE id = ?';
      console.log(`Creando apartado para producto ${item.id_producto}: stock_actual ANTES=${producto.stock_actual}, stock_apartado ANTES=${producto.stock_apartado}, cantidad_apartada=${item.cantidad}`);
      await connection.query(updateStockQuery, [item.cantidad, item.cantidad, item.id_producto]);
      console.log(`Creando apartado para producto ${item.id_producto}: stock_actual DESPUÉS=${producto.stock_actual - item.cantidad}, stock_apartado DESPUÉS=${producto.stock_apartado + item.cantidad}`);


      totalApartadoCalculado += item.cantidad * item.precio_unitario_apartado;
    }

    const apartadoData = {
      fecha_apartado: new Date(),
      fecha_vencimiento,
      estado: 'Pendiente',
      id_cliente: id_cliente || null,
      id_empleado,
      total_apartado: totalApartadoCalculado,
      notas: notas || null,
    };

    const [apartadoResult] = await connection.query('INSERT INTO apartados SET ?', [apartadoData]);
    const idApartado = apartadoResult.insertId;

    for (const item of items) {
      const detalleData = {
        id_apartado: idApartado,
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario_apartado: item.precio_unitario_apartado,
      };
      await connection.query('INSERT INTO apartados_detalle SET ?', [detalleData]);
    }

    await connection.commit();
    connection.release();

    res.status(201).json({
      message: 'Apartado creado exitosamente.',
      id_apartado: idApartado,
      ...apartadoData
    });

  } catch (error) {
    console.error('Error al crear el apartado:', error);
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    res.status(500).json({ message: 'Error interno del servidor al crear el apartado.', error: error.message });
  }
};

// Listar todos los apartados
exports.getAllApartados = async (req, res) => {
  try {
    const query = `
      SELECT 
        a.id, a.fecha_apartado, a.fecha_vencimiento, a.estado, a.total_apartado, a.notas,
        e.nombre AS nombre_empleado, e.apellidos AS apellidos_empleado,
        c.nombre AS nombre_cliente, c.apellidos AS apellidos_cliente
      FROM apartados a
      JOIN empleados e ON a.id_empleado = e.id
      LEFT JOIN clientes c ON a.id_cliente = c.id
      ORDER BY a.fecha_apartado DESC
    `;
    const [rows] = await pool.query(query);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener los apartados:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener los apartados.', error: error.message });
  }
};

// Obtener detalle de un apartado
exports.getApartadoDetailById = async (req, res) => {
    const { id } = req.params;
    try {
        const apartadoQuery = `
            SELECT 
                a.id, a.fecha_apartado, a.fecha_vencimiento, a.estado, a.total_apartado, a.notas,
                e.nombre AS nombre_empleado, e.apellidos AS apellidos_empleado,
                c.nombre AS nombre_cliente, c.apellidos AS apellidos_cliente
            FROM apartados a
            JOIN empleados e ON a.id_empleado = e.id
            LEFT JOIN clientes c ON a.id_cliente = c.id
            WHERE a.id = ?
        `;
        const [apartadoRows] = await pool.query(apartadoQuery, [id]);

        if (apartadoRows.length === 0) {
            return res.status(404).json({ message: 'Apartado no encontrado.' });
        }

        const detailQuery = `
            SELECT 
                ad.id_producto, p.nombre AS nombre_producto, p.codigo_barras,
                ad.cantidad, ad.precio_unitario_apartado
            FROM apartados_detalle ad
            JOIN productos p ON ad.id_producto = p.id
            WHERE ad.id_apartado = ?
        `;
        const [detailRows] = await pool.query(detailQuery, [id]);

        res.status(200).json({
            apartado: apartadoRows[0],
            detalles: detailRows
        });

    } catch (error) {
        console.error(`Error al obtener el detalle del apartado ${id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al obtener el detalle del apartado.', error: error.message });
    }
};

// Actualizar estado de un apartado
exports.updateApartadoStatus = async (req, res) => {
    const { id: apartadoId } = req.params; // Renombrado para claridad
    const { estado: nuevoEstado } = req.body;

    if (!nuevoEstado || !['Pagado', 'Vencido', 'Cancelado', 'Pendiente'].includes(nuevoEstado)) {
        return res.status(400).json({ message: 'Estado no válido proporcionado.' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [apartadoRows] = await connection.query('SELECT * FROM apartados WHERE id = ? FOR UPDATE', [apartadoId]);
        if (apartadoRows.length === 0) {
            await connection.rollback();
            connection.release();
            return res.status(404).json({ message: 'Apartado no encontrado.' });
        }
        const apartadoActual = apartadoRows[0];

        if (apartadoActual.estado === nuevoEstado) {
            await connection.rollback();
            connection.release();
            return res.status(200).json({ message: `El apartado ya se encuentra en estado '${nuevoEstado}'.`, apartado: apartadoActual });
        }
        
        const [details] = await connection.query('SELECT id_producto, cantidad FROM apartados_detalle WHERE id_apartado = ?', [apartadoId]);

        // Lógica de ajuste de stock
        if (apartadoActual.estado === 'Pendiente') {
            if (nuevoEstado === 'Cancelado' || nuevoEstado === 'Vencido') {
                console.log(`Apartado ${apartadoId} cambiando de Pendiente a ${nuevoEstado}. Devolviendo stock.`);
                for (const item of details) {
                    const [pRows] = await connection.query('SELECT stock_apartado FROM productos WHERE id = ? FOR UPDATE', [item.id_producto]);
                    if (pRows[0].stock_apartado < item.cantidad) {
                        // Esto no debería ocurrir si la creación del apartado fue correcta y no hubo otras modificaciones.
                        // Indica una inconsistencia. Por seguridad, no hacer negativo el stock_apartado.
                        console.warn(`Advertencia: stock_apartado para producto ${item.id_producto} es ${pRows[0].stock_apartado}, pero se intentan devolver ${item.cantidad}. Se ajustará a 0.`);
                        await connection.query(
                            'UPDATE productos SET stock_actual = stock_actual + ?, stock_apartado = 0 WHERE id = ?',
                            [pRows[0].stock_apartado, item.id_producto] // Devuelve lo que realmente estaba apartado
                        );
                    } else {
                         await connection.query(
                            'UPDATE productos SET stock_actual = stock_actual + ?, stock_apartado = stock_apartado - ? WHERE id = ?',
                            [item.cantidad, item.cantidad, item.id_producto]
                        );
                    }
                }
            } else if (nuevoEstado === 'Pagado') {
                console.log(`Apartado ${apartadoId} cambiando de Pendiente a Pagado. Ajustando stock_apartado.`);
                for (const item of details) {
                     const [pRows] = await connection.query('SELECT stock_apartado FROM productos WHERE id = ? FOR UPDATE', [item.id_producto]);
                     if (pRows[0].stock_apartado < item.cantidad) {
                        console.warn(`Advertencia: stock_apartado para producto ${item.id_producto} es ${pRows[0].stock_apartado}, pero se intentan confirmar como pagados ${item.cantidad} (deberían coincidir). Se ajustará stock_apartado a 0.`);
                        await connection.query('UPDATE productos SET stock_apartado = 0 WHERE id = ?', [item.id_producto]);
                     } else {
                        await connection.query(
                            'UPDATE productos SET stock_apartado = stock_apartado - ? WHERE id = ?',
                            [item.cantidad, item.id_producto]
                        );
                     }
                    // El stock_actual ya fue decrementado al crear el apartado.
                }
            }
        } else if ((apartadoActual.estado === 'Cancelado' || apartadoActual.estado === 'Vencido') && nuevoEstado === 'Pendiente') {
            // Lógica para reactivar un apartado (restar de stock_actual, sumar a stock_apartado)
            // Asegurarse que haya stock_actual suficiente antes de hacer esto.
            console.log(`Apartado ${apartadoId} cambiando de ${apartadoActual.estado} a Pendiente. Re-apartando stock.`);
            for (const item of details) {
                const [pRows] = await connection.query('SELECT stock_actual FROM productos WHERE id = ? FOR UPDATE', [item.id_producto]);
                if (pRows[0].stock_actual < item.cantidad) {
                    await connection.rollback();
                    connection.release();
                    return res.status(409).json({ message: `No hay suficiente stock actual para reactivar el apartado del producto ID ${item.id_producto}.` });
                }
                await connection.query(
                    'UPDATE productos SET stock_actual = stock_actual - ?, stock_apartado = stock_apartado + ? WHERE id = ?',
                    [item.cantidad, item.cantidad, item.id_producto]
                );
            }
        }
        // Otros cambios de estado (ej. de Pagado a Cancelado) requerirían lógica más compleja (reembolsos, re-stock, etc.)
        // y están fuera del alcance de esta corrección simple.

        await connection.query('UPDATE apartados SET estado = ? WHERE id = ?', [nuevoEstado, apartadoId]);
        await connection.commit();
        connection.release();

        const [updatedApartadoRows] = await pool.query('SELECT a.*, e.nombre AS nombre_empleado, e.apellidos AS apellidos_empleado, c.nombre AS nombre_cliente, c.apellidos AS apellidos_cliente FROM apartados a JOIN empleados e ON a.id_empleado = e.id LEFT JOIN clientes c ON a.id_cliente = c.id WHERE a.id = ?', [apartadoId]);
        res.status(200).json({ message: `Estado del apartado actualizado a '${nuevoEstado}'.`, apartado: updatedApartadoRows[0] });

    } catch (error) {
        console.error(`Error al actualizar estado del apartado ${apartadoId}:`, error);
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar estado del apartado.', error: error.message });
    }
};