import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // RouterLink para los enlaces de MUI
import { useAuth } from '../../contexts/AuthContext'; // O AuthContext.jsx si cambiaste el nombre

// Importaciones de Material-UI
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu'; // Opcional, para un futuro drawer/sidebar
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
// import Paper from '@mui/material/Paper'; // No se usa directamente en este ejemplo de DashboardContent
// import Link from '@mui/material/Link'; // MUI Link para usar con RouterLink, ya importado arriba como RouterLink

// Componente interno para el contenido del Dashboard
function DashboardContent() {
  const { empleado } = useAuth();

  // Determinar qué módulos mostrar según el rol (id_rol = 1 para Admin, según tu BD de ejemplo)
  const esAdmin = empleado && empleado.id_rol === 1;

  const moduleButtonStyle = {
    height: '120px', // Aumentar un poco la altura para mejor clic
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: 2, // Añadir padding interno
    boxShadow: 3, // Añadir una pequeña sombra
    '&:hover': { // Efecto al pasar el mouse
      boxShadow: 6,
      backgroundColor: 'primary.light', // Un ligero cambio de color
    }
  };

  const adminModuleButtonStyle = {
    ...moduleButtonStyle, // Hereda estilos base
    '&:hover': {
      boxShadow: 6,
      backgroundColor: 'secondary.light',
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        Panel de Control Principal
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        Bienvenido, {empleado ? `${empleado.nombre} ${empleado.apellidos}` : 'Usuario'}. Selecciona un módulo para comenzar:
      </Typography>
      <Grid container spacing={4} justifyContent="center">

        {/* Modulo de gestion de apartados */}
        <Grid item xs={12} sm={6} md={3}>
          <Button
            component={RouterLink}
            to="/pos/apartados" // <-- RUTA AL LISTADO DE APARTADOS
            variant="contained"
            color="primary"
            fullWidth
            sx={moduleButtonStyle}
          >
            <Typography variant="button" display="block" gutterBottom>Gestión de Apartados</Typography>
          </Button>
        </Grid>

        {/* Modulo de historia de ventas */}
        <Grid item xs={12} sm={6} md={3}> {/* O la estructura de Grid que tengas */}
          <Button
            component={RouterLink}
            to="/pos/ventas/historial"
            variant="contained"
            color="primary"
            fullWidth
            sx={moduleButtonStyle}
          >
            <Typography variant="button" display="block" gutterBottom>Historial de Ventas</Typography>
          </Button>
        </Grid>
        {/* Módulo de Ventas */}
        <Grid item xs={12} sm={6} md={3}>
          <Button
            component={RouterLink}
            to="/pos/ventas/nueva"
            variant="contained"
            color="primary"
            fullWidth
            sx={moduleButtonStyle}
          >
            <Typography variant="button" display="block" gutterBottom>Realizar Venta</Typography>
            {/* Podrías añadir un icono aquí */}
          </Button>
        </Grid>

        {/* Módulo de Inventario */}
        <Grid item xs={12} sm={6} md={3}>
          <Button
            component={RouterLink}
            to="/pos/inventario" // Esta ruta debería llevar al listado de productos
            variant="contained"
            color="primary"
            fullWidth
            sx={moduleButtonStyle}
          >
            <Typography variant="button" display="block" gutterBottom>Inventario</Typography>
          </Button>
        </Grid>

        {/* Módulos solo para Admin */}
        {esAdmin && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                component={RouterLink}
                to="/pos/pedidos-proveedores" // Ajusta esta ruta
                variant="outlined"
                color="secondary"
                fullWidth
                sx={adminModuleButtonStyle}
              >
                <Typography variant="button" display="block" gutterBottom>Pedidos</Typography>
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                component={RouterLink}
                to="/pos/reportes" // Ajusta esta ruta
                variant="outlined"
                color="secondary"
                fullWidth
                sx={adminModuleButtonStyle}
              >
                <Typography variant="button" display="block" gutterBottom>Reportes</Typography>
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                component={RouterLink}
                to="/pos/usuarios" // Ajusta esta ruta
                variant="outlined"
                color="secondary"
                fullWidth
                sx={adminModuleButtonStyle}
              >
                <Typography variant="button" display="block" gutterBottom>Usuarios</Typography>
              </Button>
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  );
}

export default function POSDashboardPage() {
  const { empleado, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/pos/login'); // Redirigir al login después de cerrar sesión
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          {/* Opcional: IconButton para un menú lateral si lo implementas después */}
          {/*
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            FarMax POS
          </Typography>
          {empleado && (
            <Typography sx={{ mr: 2 }}>
              {empleado.nombre} {/* Mostrar solo el nombre en la AppBar por brevedad */}
            </Typography>
          )}
          <Button color="inherit" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </Toolbar>
      </AppBar>

      {/* Contenido principal del Dashboard */}
      <Box
        component="main"
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[100]
              : theme.palette.grey[900],
          flexGrow: 1,
          overflow: 'auto', // Para scroll si el contenido es largo
          py: { xs: 2, md: 3 }, // Padding vertical responsivo
          px: { xs: 2, md: 3 }  // Padding horizontal responsivo
        }}
      >
        <DashboardContent />
      </Box>

      {/* Pie de página opcional */}
      <Box component="footer" sx={{ p: 2, mt: 'auto', backgroundColor: (theme) => theme.palette.grey[200], borderTop: '1px solid', borderColor: (theme) => theme.palette.divider }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Farmacia - ITS La Huerta. Todos los derechos reservados.
        </Typography>
      </Box>
    </Box>
  );
}

