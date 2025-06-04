import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getAllApartadosAPI, updateApartadoStatusAPI } from '../../services/apartadoService.js'; // Ajusta la ruta si es necesario

// Importaciones de Material-UI
import {
    Box, Typography, Button, Container, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton,
    CircularProgress, Alert, TextField, InputAdornment, Tooltip,
    Select, MenuItem, FormControl, InputLabel, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit'; // Para cambiar estado
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';

// Función para formatear la fecha (puedes moverla a utils)
const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleDateString('es-MX', {
            year: 'numeric', month: '2-digit', day: '2-digit'
        });
    } catch (error) { return 'Error fecha'; }
};

// Colores para los chips de estado
const statusColors = {
    Pendiente: 'warning',
    Pagado: 'success',
    Vencido: 'error',
    Cancelado: 'default',
};

export default function ApartadosListPage() {
    const [apartados, setApartados] = useState([]);
    const [filteredApartados, setFilteredApartados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const fetchApartados = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllApartadosAPI();
            setApartados(data || []);
            setFilteredApartados(data || []);
        } catch (err) {
            setError(err.message || 'Error al cargar los apartados.');
            setApartados([]);
            setFilteredApartados([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApartados();
    }, []);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filteredData = apartados.filter(apartado => {
            return (
                (apartado.id?.toString().includes(lowercasedFilter)) ||
                (apartado.estado?.toLowerCase().includes(lowercasedFilter)) ||
                (`${apartado.nombre_empleado || ''} ${apartado.apellidos_empleado || ''}`.toLowerCase().includes(lowercasedFilter)) ||
                (`${apartado.nombre_cliente || ''} ${apartado.apellidos_cliente || ''}`.toLowerCase().includes(lowercasedFilter))
            );
        });
        setFilteredApartados(filteredData);
    }, [searchTerm, apartados]);

    const handleViewApartadoDetail = (apartadoId) => {
        navigate(`/pos/apartados/detalle/${apartadoId}`);
    };

    const handleStatusChange = async (apartadoId, nuevoEstado) => {
        // Optimistic UI update (opcional, o mostrar un loader)
        // const originalApartados = [...apartados];
        // setApartados(prev => prev.map(ap => ap.id === apartadoId ? {...ap, estado: nuevoEstado} : ap));
        try {
            await updateApartadoStatusAPI(apartadoId, nuevoEstado);
            fetchApartados(); // Recargar para asegurar consistencia
            // Mostrar mensaje de éxito (ej. con un Snackbar)
        } catch (err) {
            setError(err.message || `Error al actualizar estado del apartado ${apartadoId}.`);
            // setApartados(originalApartados); // Revertir si la actualización optimista falló
        }
    };

    const handleAddApartado = () => {
        // navigate('/pos/apartados/nuevo');
        alert('Funcionalidad "Agregar Nuevo Apartado" aún no implementada.');
    };


    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress /> <Typography sx={{ ml: 2 }}>Cargando apartados...</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}> {/* MaxWidth xl para tablas más anchas */}
            <Paper sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap' }}>
                    <Button
                        variant="outlined" color="secondary" startIcon={<ArrowBackIcon />}
                        component={RouterLink} to="/pos/dashboard" sx={{ mb: 2 }}
                    >
                        Volver al Dashboard
                    </Button>
                    <Tooltip title="Recargar listado">
                        <IconButton onClick={fetchApartados} color="primary" sx={{ mb: 2 }}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
                    <Typography component="h1" variant="h5" color="primary" gutterBottom sx={{ flexGrow: 1, mb: { xs: 2, sm: 0 } }}>
                        Gestión de Apartados
                    </Typography>
                    <Button
                        variant="contained" color="primary" startIcon={<AddCircleOutlineIcon />}
                        onClick={handleAddApartado} // Cuando la página de nuevo apartado exista
                    // component={RouterLink} to="/pos/apartados/nuevo"
                    >
                        Nuevo Apartado
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <TextField
                    label="Buscar Apartado (ID, Estado, Empleado, Cliente)"
                    variant="outlined" fullWidth value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} sx={{ mb: 3 }}
                    InputProps={{
                        startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
                    }}
                />

                {filteredApartados.length === 0 && !loading && !error && (
                    <Typography sx={{ textAlign: 'center', my: 3 }}>No se encontraron apartados.</Typography>
                )}

                {filteredApartados.length > 0 && (
                    <TableContainer component={Paper} elevation={0} variant="outlined">
                        <Table sx={{ minWidth: 900 }} aria-label="tabla de apartados" size="small">
                            <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[200] }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha Apartado</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha Vencimiento</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Cliente</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Empleado</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Total</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Estado</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredApartados.map((apartado) => (
                                    <TableRow key={apartado.id} hover>
                                        <TableCell>{apartado.id}</TableCell>
                                        <TableCell>{formatDate(apartado.fecha_apartado)}</TableCell>
                                        <TableCell>{formatDate(apartado.fecha_vencimiento)}</TableCell>
                                        <TableCell>{`${apartado.nombre_cliente || ''} ${apartado.apellidos_cliente || ''}`.trim() || 'N/A'}</TableCell>
                                        <TableCell>{`${apartado.nombre_empleado || ''} ${apartado.apellidos_empleado || ''}`.trim()}</TableCell>
                                        <TableCell align="right">${apartado.total_apartado ? parseFloat(apartado.total_apartado).toFixed(2) : '0.00'}</TableCell>
                                        <TableCell align="center">
                                            <FormControl size="small" sx={{ minWidth: 120 }}>
                                                {/* <InputLabel id={`status-select-label-${apartado.id}`}>Estado</InputLabel> */}
                                                <Select
                                                    labelId={`status-select-label-${apartado.id}`}
                                                    value={apartado.estado}
                                                    onChange={(e) => handleStatusChange(apartado.id, e.target.value)}
                                                    // label="Estado"
                                                    renderValue={(selectedValue) => (
                                                        <Chip label={selectedValue} color={statusColors[selectedValue] || 'default'} size="small" />
                                                    )}
                                                >
                                                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                                                    <MenuItem value="Pagado">Pagado</MenuItem>
                                                    <MenuItem value="Vencido">Vencido</MenuItem>
                                                    <MenuItem value="Cancelado">Cancelado</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Ver Detalle del Apartado">
                                                <IconButton
                                                    color="info"
                                                    onClick={() => handleViewApartadoDetail(apartado.id)}
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