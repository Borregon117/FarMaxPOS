import apiClient from './api';

/**
 * Crea una nueva venta.
 * @param {object} saleData - Los datos de la venta, incluyendo:
 * { metodo_pago, id_empleado, id_cliente (opcional), items: [{id_producto, cantidad, precio_unitario}] }
 * @returns {Promise<object>} La respuesta del servidor con los detalles de la venta creada.
 */
export const createSaleAPI = async (saleData) => {
  try {
    const response = await apiClient.post('/ventas', saleData);
    return response.data; // El backend devuelve { message, id_venta, folio_ticket, total_venta }
  } catch (error) {
    console.error('Error en servicio al crear la venta:', error.response?.data || error.message);
    // Lanzar el error con el mensaje del backend si está disponible
    const backendError = error.response?.data;
    if (backendError && backendError.message) {
      throw new Error(backendError.message);
    }
    throw new Error('Error de red o servidor al crear la venta.');
  }
};

/**
 * Obtiene el historial de todas las ventas.
 * @returns {Promise<Array>} Un array de objetos de venta.
 */
export const getAllSalesAPI = async () => {
  try {
    const response = await apiClient.get('/ventas');
    return response.data;
  } catch (error) {
    console.error('Error en servicio al obtener historial de ventas:', error.response?.data?.message || error.message);
    throw error.response?.data || new Error('Error de red o servidor al obtener el historial de ventas.');
  }
};

/**
 * Obtiene el detalle de una venta específica por su ID.
 * @param {number|string} id - El ID de la venta.
 * @returns {Promise<object>} Un objeto con los datos de la venta y sus detalles.
 */
export const getSaleDetailByIdAPI = async (id) => {
  try {
    const response = await apiClient.get(`/ventas/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error en servicio al obtener detalle de venta ${id}:`, error.response?.data?.message || error.message);
    throw error.response?.data || new Error(`Error de red o servidor al obtener el detalle de la venta ${id}.`);
  }
};