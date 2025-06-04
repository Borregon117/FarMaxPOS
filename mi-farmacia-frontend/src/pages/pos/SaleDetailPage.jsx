import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { getSaleDetailByIdAPI } from '../../services/saleService.js'; // Asegúrate que la ruta sea correcta

// Importaciones de Material-UI
import {
  Box, Typography, Button, Container, Paper, Grid, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  CircularProgress, Alert, Divider, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptIcon from '@mui/icons-material/Receipt'; // Icono para el detalle de venta

// Función para formatear la fecha y hora (puedes moverla a un archivo utils si la usas en más sitios)
const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    return date.toLocaleString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return 'Error de fecha';
  }
};

export default function SaleDetailPage() {
  const { id: saleId } = useParams(); // Obtener el ID de la venta de los parámetros de la URL
  const navigate = useNavigate();
  
  const [saleDetails, setSaleDetails] = useState(null); // Almacenará { venta: {}, detalles: [] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!saleId) {
      setError('ID de venta no proporcionado.');
      setLoading(false);
      return;
    }

    const fetchSaleDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSaleDetailByIdAPI(saleId);
        setSaleDetails(data);
      } catch (err) {
        setError(err.message || `Error al cargar el detalle de la venta ${saleId}.`);
        setSaleDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDetail();
  }, [saleId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando detalle de la venta...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/pos/ventas/historial')}
        >
          Volver al Historial
        </Button>
      </Container>
    );
  }

  if (!saleDetails || !saleDetails.venta) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" color="text.secondary" align="center">
          No se encontraron detalles para esta venta.
        </Typography>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/pos/ventas/historial')}
          >
            Volver al Historial
          </Button>
        </Box>
      </Container>
    );
  }

  const { venta, detalles } = saleDetails;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
          <Typography component="h1" variant="h5" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon sx={{ mr: 1 }} /> Detalle de Venta
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/pos/ventas/historial')}
          >
            Volver al Historial
          </Button>
        </Box>
        
        <Divider sx={{ my: 2 }} />

        {/* Información de la Cabecera de la Venta */}
        <Typography variant="h6" gutterBottom>Información General</Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1"><strong>Folio Ticket:</strong> {venta.folio_ticket}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1"><strong>Fecha y Hora:</strong> {formatDateTime(venta.fecha_hora)}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1"><strong>Total Venta:</strong> ${venta.total ? parseFloat(venta.total).toFixed(2) : '0.00'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1"><strong>Método de Pago:</strong> {venta.metodo_pago}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1"><strong>Empleado:</strong> {`${venta.nombre_empleado || ''} ${venta.apellidos_empleado || ''}`.trim()}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1"><strong>Cliente:</strong> {`${venta.nombre_cliente || ''} ${venta.apellidos_cliente || ''}`.trim() || 'Público General'}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Tabla de Productos Vendidos */}
        <Typography variant="h6" gutterBottom>Productos Vendidos</Typography>
        {detalles && detalles.length > 0 ? (
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table sx={{ minWidth: 650 }} aria-label="tabla de productos vendidos" size="small">
              <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Código Barras</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Producto</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Cantidad</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Precio Unit.</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detalles.map((item, index) => (
                  <TableRow key={`${item.id_producto}-${index}`}> {/* Usar index si id_producto puede repetirse en una misma venta (no debería ser el caso con ventas_detalle.id como PK) */}
                    <TableCell>{item.codigo_barras}</TableCell>
                    <TableCell>{item.nombre_producto}</TableCell>
                    <TableCell align="right">{item.cantidad}</TableCell>
                    <TableCell align="right">${item.precio_unitario ? parseFloat(item.precio_unitario).toFixed(2) : '0.00'}</TableCell>
                    <TableCell align="right">${item.subtotal ? parseFloat(item.subtotal).toFixed(2) : '0.00'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 1 }}>No hay productos detallados para esta venta.</Typography>
        )}
        {/* Aquí podrías añadir un botón para "Imprimir Ticket" en el futuro */}
      </Paper>
    </Container>
  );
}