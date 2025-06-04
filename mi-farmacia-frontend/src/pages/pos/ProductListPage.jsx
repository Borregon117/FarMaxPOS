import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
// Asegúrate que la ruta a ProductService.js sea correcta y que el nombre del archivo coincida
import { getAllProductsAPI, deleteProductAPI } from '../../services/ProductService';

// Importaciones de Material-UI
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Icono para volver
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

// Componente de la página de listado de productos
export default function ProductListPage() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [deleteError, setDeleteError] = useState(null);


    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllProductsAPI();
            setProducts(data || []);
            setFilteredProducts(data || []);
        } catch (err) {
            setError(err.message || 'Error al cargar productos.');
            setProducts([]);
            setFilteredProducts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        const lowercasedFilter = searchTerm.toLowerCase();
        const filteredData = products.filter(item => {
            // Comprobar si item es un objeto antes de llamar a Object.keys
            if (typeof item === 'object' && item !== null) {
                return Object.keys(item).some(key =>
                    (typeof item[key] === 'string' && item[key].toLowerCase().includes(lowercasedFilter)) ||
                    (typeof item[key] === 'number' && item[key].toString().toLowerCase().includes(lowercasedFilter))
                );
            }
            return false; // Si item no es un objeto, no se puede filtrar
        });
        setFilteredProducts(filteredData);
    }, [searchTerm, products]);

    const handleEditProduct = (id) => {
        navigate(`/pos/inventario/editar/${id}`);
    };

    const handleClickOpenDeleteDialog = (product) => {
        setProductToDelete(product);
        setDeleteError(null);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setProductToDelete(null);
    };

    const handleDeleteProduct = async () => {
        if (!productToDelete) return;
        setDeleteError(null);
        try {
            await deleteProductAPI(productToDelete.id);
            handleCloseDeleteDialog();
            fetchProducts();
        } catch (err) {
            console.error('Error al eliminar producto:', err);
            setDeleteError(err.message || 'Error al eliminar el producto. Puede estar referenciado.');
        }
    };


    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Cargando productos...</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<ArrowBackIcon />}
                        component={RouterLink}
                        to="/pos/dashboard" // Ruta al dashboard
                        sx={{ mb: 2 }}
                    >
                        Volver al Panel De Control
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
                    <Typography component="h1" variant="h5" color="primary" gutterBottom sx={{ flexGrow: 1, mb: { xs: 2, sm: 0 } }}>
                        Gestión de Inventario de Productos
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddCircleOutlineIcon />}
                        component={RouterLink}
                        to="/pos/inventario/nuevo"
                    >
                        Agregar Producto
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    label="Buscar producto (por nombre, código, etc.)"
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

                {filteredProducts.length === 0 && !loading && !error && (
                    <Typography sx={{ textAlign: 'center', my: 3 }}>
                        No se encontraron productos o no hay productos registrados.
                    </Typography>
                )}

                {filteredProducts.length > 0 && (
                    <TableContainer component={Paper} elevation={2}>
                        <Table sx={{ minWidth: 650 }} aria-label="tabla de productos">
                            <TableHead sx={{ backgroundColor: (theme) => theme.palette.grey[200] }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Código Barras</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Precio Venta</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Stock Actual</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="right">Stock Mínimo</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }} align="center">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredProducts.map((product) => (
                                    <TableRow
                                        key={product.id}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: (theme) => theme.palette.action.hover } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {product.codigo_barras}
                                        </TableCell>
                                        <TableCell>{product.nombre}</TableCell>
                                        <TableCell align="right">${product.precio_venta ? parseFloat(product.precio_venta).toFixed(2) : '0.00'}</TableCell>
                                        <TableCell align="right">{product.stock_actual}</TableCell>
                                        <TableCell align="right">{product.stock_minimo}</TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                color="primary"
                                                aria-label="editar producto"
                                                onClick={() => handleEditProduct(product.id)}
                                                size="small"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                color="error"
                                                aria-label="eliminar producto"
                                                onClick={() => handleClickOpenDeleteDialog(product)}
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            {/* Diálogo de confirmación para eliminar producto */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirmar Eliminación"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        ¿Estás seguro de que deseas eliminar el producto "{productToDelete?.nombre}"?
                        Esta acción no se puede deshacer.
                    </DialogContentText>
                    {deleteError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {deleteError}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleDeleteProduct} color="error" autoFocus>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
}