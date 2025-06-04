import apiClient from './api'; // Asumiendo que api.js está en la misma carpeta 'services'

/**
 * Obtiene todas las categorías del backend.
 * @returns {Promise<Array>} Un array de objetos de categoría (ej: [{id: 1, nombre: 'Analgésicos'}]).
 */
export const getAllCategoriesAPI = async () => {
    try {
        const response = await apiClient.get('/categorias');
        return response.data; // El backend devuelve un array de categorías
    } catch (error) {
        console.error('Error en servicio al obtener todas las categorías:', error.response?.data?.message || error.message);
        throw error.response?.data || new Error('Error de red o servidor al obtener categorías.');
    }
};