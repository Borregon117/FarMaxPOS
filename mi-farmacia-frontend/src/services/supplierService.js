import apiClient from './api'; // Asumiendo que api.js está en la misma carpeta 'services'

/**
 * Obtiene todos los proveedores del backend.
 * @returns {Promise<Array>} Un array de objetos de proveedor (ej: [{id: 1, nombre: 'Distribuidora...'}, ...]).
 */
export const getAllSuppliersAPI = async () => {
    try {
        const response = await apiClient.get('/proveedores');
        return response.data; // El backend devuelve un array de proveedores
    } catch (error) {
        console.error('Error en servicio al obtener todos los proveedores:', error.response?.data?.message || error.message);
        throw error.response?.data || new Error('Error de red o servidor al obtener proveedores.');
    }
};