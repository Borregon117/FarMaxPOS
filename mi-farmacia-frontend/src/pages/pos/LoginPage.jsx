// ============== ARCHIVO: src/pages/pos/LoginPage.jsx ==============
// (Crea este archivo: mi-farmacia-frontend/src/pages/pos/LoginPage.jsx)

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

// Importaciones de Material-UI
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { createTheme, ThemeProvider } from '@mui/material/styles';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="[https://tu-tec-o-farmacia.com/](https://tu-tec-o-farmacia.com/)">
        Farmacia POS - ITS La Huerta
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const defaultTheme = createTheme();

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error: authError, setError: setAuthError, loading: authLoading } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLocalError(''); 
    setAuthError(null); 

    if (!usuario || !contrasena) {
      setLocalError('Por favor, ingresa usuario y contraseña.');
      return;
    }

    const success = await login({ usuario, contrasena });
    if (success) {
      navigate('/pos/dashboard'); 
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '100vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url([https://source.unsplash.com/random?pharmacy,clinic,medicine](https://source.unsplash.com/random?pharmacy,clinic,medicine))', // Imagen aleatoria
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Iniciar Sesión - POS Farmacia
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="usuario"
                label="Nombre de Usuario"
                name="usuario"
                autoComplete="username"
                autoFocus
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                error={!!localError && !usuario}
                helperText={!!localError && !usuario ? "Campo requerido" : ""}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="contrasena"
                label="Contraseña"
                type="password"
                id="contrasena"
                autoComplete="current-password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                error={!!localError && !contrasena}
                helperText={!!localError && !contrasena ? "Campo requerido" : ""}
              />
              {/* Mostrar errores */}
              {localError && !authError && ( // Mostrar error local solo si no hay error de autenticación
                <Alert severity="warning" sx={{ mt: 2, width: '100%' }}>
                  {localError}
                </Alert>
              )}
              {authError && (
                <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
                  {authError}
                </Alert>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={authLoading}
              >
                {authLoading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
              </Button>
              <Copyright sx={{ mt: 5 }} />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}