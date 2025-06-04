import apiClient from './api';


export const getProducts = async () => {
    try {
        const response = await apiClient.get('/productos');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        return error;
    }
}

export const getProductById = async (id) => {
    try {
        const response = await apiClient.get(`/productos/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener el producto:', error);
        return error;
    }
}

export const createProduct = async (productData) => {
    try {
        const response = await apiClient.post('/productos', productData);
        return response.data;
    } catch (error) {
        console.error('Error al crear el producto:', error);
        return error;
    }
}

export const updateProduct = async (id, productData) => {
    try {
        const response = await apiClient.put(`/productos/${id}`, productData);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el producto:', error);
        return error;
    }
}

export const deleteProduct = async (id) => {
    try {
        const response = await apiClient.delete(`/productos/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar el producto:', error);
        return error;
    }
}

export const getAllProductsAPI = async () => {
  try {
    const response = await apiClient.get('/productos');
    return response.data; // El backend devuelve un array de productos directamente
  } catch (error) {
    console.error('Error en servicio al obtener todos los productos:', error.response?.data?.message || error.message);
    throw error.response?.data || new Error('Error de red o servidor al obtener productos.');
  }
};


export const getProductByIdAPI = async (id) => {
  try {
    const response = await apiClient.get(`/productos/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error en servicio al obtener producto ${id}:`, error.response?.data?.message || error.message);
    throw error.response?.data || new Error(`Error de red o servidor al obtener el producto ${id}.`);
  }
};


export const createProductAPI = async (productData) => {
  try {
    const response = await apiClient.post('/productos', productData);
    return response.data; // El backend devuelve { message, id, ...producto }
  } catch (error) {
    console.error('Error en servicio al crear producto:', error.response?.data?.message || error.message);
    throw error.response?.data || new Error('Error de red o servidor al crear el producto.');
  }
};


export const updateProductAPI = async (id, productData) => {
  try {
    const response = await apiClient.put(`/productos/${id}`, productData);
    return response.data; // El backend devuelve { message, producto }
  } catch (error) {
    console.error(`Error en servicio al actualizar producto ${id}:`, error.response?.data?.message || error.message);
    throw error.response?.data || new Error(`Error de red o servidor al actualizar el producto ${id}.`);
  }
};


export const deleteProductAPI = async (id) => {
  try {
    const response = await apiClient.delete(`/productos/${id}`);
    return response.data; // El backend devuelve { message }
  } catch (error) {
    console.error(`Error en servicio al eliminar producto ${id}:`, error.response?.data?.message || error.message);
    throw error.response?.data || new Error(`Error de red o servidor al eliminar el producto ${id}.`);
  }
};


