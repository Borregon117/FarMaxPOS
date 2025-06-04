import React, { createContext, useState, useContext,useEffect } from 'react';
import { loginAPI } from '../services/authService'; // Usamos la función renombrada
import { useNavigate } from 'react-router-dom'; // Para redirección global si es necesario

//const AuthContexts = createContext(null);
//import { login as loginService, logout as logoutService } from '../services/AuthService';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [empleado, setEmpleado] = useState(JSON.parse(localStorage.getItem('empleado'))); // Guardamos el objeto empleado
    const [loading, setLoading] = useState(false); // Para indicar estado de carga
    const [error, setError] = useState(null); // Para manejar errores de login
    //const navigate = useNavigate(); // Descomentar si necesitas navegar desde el contexto

    // Efecto para cargar el token y el empleado desde localStorage al iniciar
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedEmpleado = localStorage.getItem('empleado');
        if (storedToken) {
            setToken(storedToken);
        }
        if (storedEmpleado) {
            try {
                setEmpleado(JSON.parse(storedEmpleado));
            } catch (e) {
                console.error("Error al parsear datos del empleado desde localStorage", e);
                localStorage.removeItem('empleado'); // Limpiar si está corrupto
            }
        }
    }, []);

    const login = async (credentials) => {
        setLoading(true);
        setError(null);
        try {
            const data = await loginAPI(credentials); // Llama al servicio
            localStorage.setItem('token', data.token);
            localStorage.setItem('empleado', JSON.stringify(data.empleado)); // Guardar objeto empleado
            setToken(data.token);
            setEmpleado(data.empleado);
            setLoading(false);
            return true; // Indicar éxito
        } catch (err) {
            console.error("Fallo el login desde AuthContext:", err);
            setError(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
            setLoading(false);
            localStorage.removeItem('token'); // Limpiar token en caso de error
            localStorage.removeItem('empleado'); // Limpiar empleado en caso de error
            setToken(null);
            setEmpleado(null);
            return false; // Indicar fallo
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('empleado');
        setToken(null);
        setEmpleado(null);
        // Opcional: Redirigir al login. Esto es mejor manejarlo en el componente que llama a logout.
        // navigate('/pos/login');
        console.log("Usuario deslogueado");
    };

    return (
    <AuthContext.Provider value={{ token, empleado, login, logout, loading, error, setError, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
    )
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};