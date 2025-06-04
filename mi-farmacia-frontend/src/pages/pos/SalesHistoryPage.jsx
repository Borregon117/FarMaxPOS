import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getAllSalesAPI } from '../../services/saleService.js'; // Asegúrate que la ruta sea correcta

// Importaciones de Material-UI
import {
  Box, Typography, Button, Container, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, IconButton,
  CircularProgress, Alert, TextField, InputAdornment, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Icono para ver detalle
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh'; // Icono para recargar

// Función para formatear la fecha y hora
const formatDateTime = (isoString) => {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
        return 'Fecha inválida';
    }
    return date.toLocaleString('es-MX', { // Ajusta el locale según necesidad
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  } catch (error) {
    console.error("Error formateando fecha:", error);
    return 'Error de fecha';
  }
};

export default function SalesHistoryPage() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllSalesAPI();
      setSales(data || []);
      setFilteredSales(data || []);
    } catch (err) {
      setError(err.message || 'Error al cargar el historial de ventas.');
      setSales([]);
      setFilteredSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    const filteredData = sales.filter(sale => {
      // Filtrar por folio, nombre de empleado, o nombre de cliente
      return (
        sale.folio_ticket?.toLowerCase().includes(lowercasedFilter) ||
        `${sale.nombre_empleado || ''} ${sale.apellidos_empleado || ''}`.toLowerCase().includes(lowercasedFilter) ||
        `${sale.nombre_cliente || ''} ${sale.apellidos_cliente || ''}`.toLowerCase().includes(lowercasedFilter) ||
        sale.metodo_pago?.toLowerCase().includes(lowercasedFilter)
      );
    });
    setFilteredSales(filteredData);
  }, [searchTerm, sales]);

  const handleViewSaleDetail = (saleId) => {
    // Navegar a la página de detalle de venta (aún no creada)
    navigate(`/pos/ventas/detalle/${saleId}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando historial de ventas...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: {xs: 2, md: 3}, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<ArrowBackIcon />}
            component={RouterLink}
            to="/pos/dashboard"
            sx={{ mb: 2 }}
          >
            Volver al Dashboard
          </Button>
          <Tooltip title="Recargar historial">
            <IconButton onClick={fetchSales} color="primary" sx={{ mb: 2 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Typography component="h1" variant="h5" color="primary" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          Historial de Ventas
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Buscar venta (Folio, Empleado, Cliente, Método Pago)"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {filteredSales.length === 0 && !loading && !error && (
          <Typography sx={{ textAlign: 'center', my: 3 }}>
            No se encontraron ventas o no hay ventas registradas.
          </Typography>
        )}

        {filteredSales.length > 0 && (
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table sx={{ minWidth: 750 }} aria-label="tabla de historial de ventas" size="small">
              <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[200] }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Folio Ticket</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fecha y Hora</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Empleado</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">Total</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Método Pago</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Detalle</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSales.map((sale) => (
                  <TableRow
                    key={sale.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: (theme) => theme.palette.action.hover } }}
                  >
                    <TableCell component="th" scope="row">{sale.folio_ticket}</TableCell>
                    <TableCell>{formatDateTime(sale.fecha_hora)}</TableCell>
                    <TableCell>{`${sale.nombre_empleado || ''} ${sale.apellidos_empleado || ''}`.trim()}</TableCell>
                    <TableCell>{`${sale.nombre_cliente || ''} ${sale.apellidos_cliente || ''}`.trim() || 'N/A'}</TableCell>
                    <TableCell align="right">${sale.total ? parseFloat(sale.total).toFixed(2) : '0.00'}</TableCell>
                    <TableCell>{sale.metodo_pago}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver Detalle de Venta">
                        <IconButton
                          color="info"
                          aria-label="ver detalle de venta"
                          onClick={() => handleViewSaleDetail(sale.id)}
                          size="small"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
}