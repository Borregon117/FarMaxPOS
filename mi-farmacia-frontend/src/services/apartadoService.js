import apiClient from './api';

/**
 * Crea un nuevo apartado.
 * @param {object} apartadoData - Datos del apartado, incluyendo:
 * { id_empleado, fecha_vencimiento, items: [{id_producto, cantidad, precio_unitario_apartado}], 
 * id_cliente (opcional), notas (opcional) }
 * @returns {Promise<object>} La respuesta del servidor con los detalles del apartado creado.
 */
export const createApartadoAPI = async (apartadoData) => {
    try {
        const response = await apiClient.post('/apartados', apartadoData);
        return response.data;
    } catch (error) {
        console.error('Error en servicio al crear el apartado:', error.response?.data || error.message);
        const backendError = error.response?.data;
        if (backendError && backendError.message) {
            throw new Error(backendError.message);
        }
        throw new Error('Error de red o servidor al crear el apartado.');
    }
};

/**
 * Obtiene todos los apartados.
 * @returns {Promise<Array>} Un array de objetos de apartado.
 */
export const getAllApartadosAPI = async () => {
    try {
        const response = await apiClient.get('/apartados');
        return response.data;
    } catch (error) {
        console.error('Error en servicio al obtener todos los apartados:', error.response?.data?.message || error.message);
        throw error.response?.data || new Error('Error de red o servidor al obtener los apartados.');
    }
};

/**
 * Obtiene el detalle de un apartado específico por su ID.
 * @param {number|string} id - El ID del apartado.
 * @returns {Promise<object>} Un objeto con los datos del apartado y sus detalles.
 */
export const getApartadoDetailByIdAPI = async (id) => {
    try {
        const response = await apiClient.get(`/apartados/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error en servicio al obtener detalle de apartado ${id}:`, error.response?.data?.message || error.message);
        throw error.response?.data || new Error(`Error de red o servidor al obtener el detalle del apartado ${id}.`);
    }
};

/**
 * Actualiza el estado de un apartado.
 * @param {number|string} id - El ID del apartado.
 * @param {string} estado - El nuevo estado ('Pagado', 'Vencido', 'Cancelado', 'Pendiente').
 * @returns {Promise<object>} La respuesta del servidor con el apartado actualizado.
 */
export const updateApartadoStatusAPI = async (id, estado) => {
    try {
        const response = await apiClient.put(`/apartados/${id}/estado`, { estado });
        return response.data;
    } catch (error) {
        console.error(`Error en servicio al actualizar estado de apartado ${id}:`, error.response?.data?.message || error.message);
        const backendError = error.response?.data;
        if (backendError && backendError.message) {
            throw new Error(backendError.message);
        }
        throw new Error(`Error de red o servidor al actualizar el estado del apartado ${id}.`);
    }
};