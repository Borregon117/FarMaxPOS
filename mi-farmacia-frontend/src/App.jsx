import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import LoginPage from './pages/pos/LoginPage.jsx';
import POSDashboardPage from './pages/pos/POSDashboardPage.jsx';
import ProductListPage from './pages/pos/ProductListPage.jsx';
import AddEditProductPage from './pages/pos/AddEditProductPage.jsx';
import NewSalePage from './pages/pos/NewSalePage.jsx';
import SalesHistoryPage from './pages/pos/SalesHistoryPage.jsx';
import SaleDetailPage from './pages/pos/SaleDetailPage.jsx';
import ApartadosListPage from './pages/pos/ApartadosListPage.jsx';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';


//import SalesPage from './pages/pos/SalesPage';
//import AddEditProductPage from './pages/pos/AddEditProductPage';
//import './styles/App.css'
//Componente para rutas protegidas


const ProtectedPOSRoute = () => {
  const { isAuthenticated } = useAuth(); // Obtiene el estado de autenticación del contexto
  console.log("ProtectedPOSRoute isAuthenticated:", isAuthenticated); // Para depuración

  if (!isAuthenticated) {
    // Si no está autenticado, redirigir al login
    return <Navigate to="/pos/login" replace />;
  }
  // Si está autenticado, renderizar el contenido de la ruta hija (Outlet)
  return <Outlet />;
};


function App() {
  return (
    // El AuthProvider ya envuelve a App en main.jsx
    <Router>
      <Routes>
        {/* Rutas del Sitio Web Cliente (ejemplos) */}
        {/* <Route path="/" element={<HomePage />} /> */}
        {/* <Route path="/productos" element={<ProductCatalogPageWeb />} /> */}

        {/* Rutas del POS */}
        <Route path="/pos/login" element={<LoginPage />} />

        {/* Rutas Protegidas del POS */}
        <Route element={<ProtectedPOSRoute />}>
          <Route path="/pos/dashboard" element={<POSDashboardPage />} />
          {<Route path="/pos/inventario" element={<ProductListPage />} />}
          {<Route path="/pos/inventario/nuevo" element={<AddEditProductPage />} />}
          {<Route path="/pos/inventario/editar/:id" element={<AddEditProductPage />} />}
          <Route path="/pos/ventas/nueva" element={<NewSalePage />} />
          <Route path="/pos/ventas/historial" element={<SalesHistoryPage />} />
          <Route path="/pos/ventas/detalle/:id" element={<SaleDetailPage />} />
          <Route path="/pos/apartados" element={<ApartadosListPage />} />


          {/* ... más rutas protegidas del POS aquí ... */}
          {/* <Route path="/pos/ventas" element={<SalesPage />} /> */}
        </Route>
        {/* Ruta por defecto o para redirigir si ninguna coincide */}
        {/* Es mejor tener una ruta de inicio clara o una página 404.
              Si el usuario no está autenticado y va a "/", ProtectedPOSRoute lo mandará a /pos/login.
              Si está autenticado y va a "/", podría ir a /pos/dashboard.
              Vamos a redirigir "/" a "/pos/dashboard" si está autenticado, o a "/pos/login" si no.
          */}
        <Route
          path="/"
          element={
            localStorage.getItem('token') ? ( // Chequeo simple inicial, ProtectedPOSRoute hará el chequeo robusto
              <Navigate to="/pos/dashboard" replace />
            ) : (
              <Navigate to="/pos/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} /> {/* Redirige cualquier otra cosa a la raíz */}
      </Routes>
    </Router>
  );
}

export default App;