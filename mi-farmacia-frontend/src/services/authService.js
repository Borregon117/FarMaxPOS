
// ============== ARCHIVO: src/services/authService.js ==============
// (Crea este archivo si no existe: mi-farmacia-frontend/src/services/authService.js)

import apiClient from './api';

/**
 * Envía las credenciales de login al backend.
 * @param {object} credentials - Un objeto con { usuario, contrasena }.
 * @returns {Promise<object>} La respuesta del servidor, que incluye el token y datos del empleado.
 */
export const loginAPI = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data; // El backend devuelve { message, token, empleado }
  } catch (error) {
    // El interceptor de errores de Axios podría manejar esto,
    // o puedes lanzar el error para manejarlo en el componente.
    console.error('Error en el servicio de login:', error.response?.data?.message || error.message);
    throw error.response?.data || new Error('Error de red o servidor al intentar iniciar sesión.');
  }
};

// Podrías añadir aquí funciones para registrarEmpleado, logout (si el backend lo requiere), etc.
// export const registerAPI = async (userData) => { ... }
// export const logoutAPI = async () => { ... }