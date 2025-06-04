import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx'; // Asegúrate que la ruta y nombre sean correctos

// Servicios
import { getAllProductsAPI } from '../../services/ProductService.js'; // Para buscar productos
import { createSaleAPI } from '../../services/saleService.js';

// Importaciones de Material-UI
import {
  Box, Typography, Button, Container, Paper, Grid, TextField, Autocomplete,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
  FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Divider
} from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function NewSalePage() {
  const navigate = useNavigate();
  const { empleado } = useAuth(); // Para obtener id_empleado

  const [allProducts, setAllProducts] = useState([]); // Lista de todos los productos para el Autocomplete
  const [selectedProduct, setSelectedProduct] = useState(null); // Producto seleccionado en Autocomplete
  const [quantity, setQuantity] = useState(1); // Cantidad para el producto seleccionado
  const [cart, setCart] = useState([]); // Carrito de venta: [{...productData, cantidadEnCarrito, subtotal}]
  
  const [paymentMethod, setPaymentMethod] = useState('Efectivo'); // Método de pago por defecto
  // const [selectedCustomer, setSelectedCustomer] = useState(null); // Para futura selección de cliente

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingSale, setLoadingSale] = useState(false);
  const [error, setError] = useState(null); // Error general o de carga de productos
  const [saleError, setSaleError] = useState(null); // Error específico al crear la venta
  const [saleSuccess, setSaleSuccess] = useState(null);

  // Cargar todos los productos para el buscador/autocomplete
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoadingProducts(true);
      try {
        const productsData = await getAllProductsAPI();
        setAllProducts(productsData || []);
      } catch (err) {
        setError('Error al cargar productos para la búsqueda: ' + (err.message || 'Error desconocido'));
        setAllProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchAllProducts();
  }, []);

  const handleAddProductToCart = () => {
    if (!selectedProduct || quantity <= 0) {
      setError('Selecciona un producto y especifica una cantidad válida.');
      return;
    }
    if (selectedProduct.stock_actual < quantity) {
        setError(`Stock insuficiente para "${selectedProduct.nombre}". Disponible: ${selectedProduct.stock_actual}`);
        return;
    }

    setError(null); // Limpiar error previo

    // Verificar si el producto ya está en el carrito para actualizar cantidad
    const existingProductIndex = cart.findIndex(item => item.id === selectedProduct.id);

    if (existingProductIndex > -1) {
      const updatedCart = [...cart];
      const newQuantity = updatedCart[existingProductIndex].cantidadEnCarrito + quantity;
      if (selectedProduct.stock_actual < newQuantity) {
          setError(`Stock insuficiente para "${selectedProduct.nombre}" al sumar con lo ya agregado. Disponible: ${selectedProduct.stock_actual}`);
          return;
      }
      updatedCart[existingProductIndex].cantidadEnCarrito = newQuantity;
      updatedCart[existingProductIndex].subtotal = newQuantity * parseFloat(updatedCart[existingProductIndex].precio_venta);
      setCart(updatedCart);
    } else {
      // Agregar nuevo producto al carrito
      setCart(prevCart => [
        ...prevCart,
        {
          ...selectedProduct,
          cantidadEnCarrito: quantity,
          precio_unitario_venta: parseFloat(selectedProduct.precio_venta), // Guardar precio al momento de agregar
          subtotal: quantity * parseFloat(selectedProduct.precio_venta)
        }
      ]);
    }
    // Resetear selección para el siguiente producto
    setSelectedProduct(null);
    setQuantity(1);
    // Limpiar el input del Autocomplete (esto es un poco más complejo con Autocomplete,
    // usualmente se maneja reseteando el inputValue o usando una key)
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleQuantityChangeInCart = (productId, newQuantityStr) => {
    const newQuantity = parseInt(newQuantityStr, 10);
    if (isNaN(newQuantity) || newQuantity < 0) return; // No permitir negativo o NaN

    setCart(prevCart =>
      prevCart.map(item => {
        if (item.id === productId) {
          if (item.stock_actual < newQuantity) {
            setError(`Stock insuficiente para "${item.nombre}". Disponible: ${item.stock_actual}`);
            // Mantener la cantidad anterior o el máximo stock disponible
            return { ...item, subtotal: item.cantidadEnCarrito * item.precio_unitario_venta }; 
          }
          setError(null);
          return { ...item, cantidadEnCarrito: newQuantity, subtotal: newQuantity * item.precio_unitario_venta };
        }
        return item;
      })
    );
  };


  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0).toFixed(2);
  };

  const handleFinalizeSale = async () => {
    if (cart.length === 0) {
      setSaleError('El carrito está vacío. Agrega productos para vender.');
      return;
    }
    if (!empleado || !empleado.id) {
      setSaleError('No se pudo identificar al empleado. Por favor, inicia sesión de nuevo.');
      return;
    }

    setLoadingSale(true);
    setSaleError(null);
    setSaleSuccess(null);

    const saleData = {
      metodo_pago: paymentMethod,
      id_empleado: empleado.id,
      // id_cliente: selectedCustomer ? selectedCustomer.id : null, // Para futura implementación
      items: cart.map(item => ({
        id_producto: item.id,
        cantidad: item.cantidadEnCarrito,
        precio_unitario: item.precio_unitario_venta // Usar el precio al momento de agregar al carrito
      }))
    };

    try {
      const result = await createSaleAPI(saleData);
      setSaleSuccess(`¡Venta #${result.folio_ticket} registrada exitosamente! Total: $${result.total_venta}`);
      setCart([]); // Limpiar carrito
      // Opcional: Redirigir o mostrar opción para nueva venta/imprimir ticket
      // navigate('/pos/dashboard'); // O a una página de confirmación de venta
    } catch (err) {
      setSaleError(err.message || 'Ocurrió un error al procesar la venta.');
    } finally {
      setLoadingSale(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => navigate('/pos/dashboard')} color="primary" sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography component="h1" variant="h5" color="primary">
            Nueva Venta
          </Typography>
        </Box>

        {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Sección para agregar productos */}
        <Grid container spacing={2} alignItems="flex-end" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={7} md={8}>
            <Autocomplete
              options={allProducts}
              getOptionLabel={(option) => `${option.codigo_barras} - ${option.nombre} (Stock: ${option.stock_actual})`}
              value={selectedProduct}
              onChange={(event, newValue) => {
                setSelectedProduct(newValue);
                setError(null); // Limpiar error al seleccionar nuevo producto
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar Producto (Código o Nombre)"
                  variant="outlined"
                  helperText={selectedProduct ? `Precio: $${parseFloat(selectedProduct.precio_venta).toFixed(2)}` : " "}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingProducts ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              loading={loadingProducts}
              disabled={loadingProducts}
            />
          </Grid>
          <Grid item xs={6} sm={3} md={2}>
            <TextField
              label="Cantidad"
              type="number"
              value={quantity}
              onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setQuantity(val >= 1 ? val : 1);
              }}
              InputProps={{ inputProps: { min: 1 } }}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6} sm={2} md={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddProductToCart}
              disabled={!selectedProduct || loadingProducts}
              fullWidth
              startIcon={<AddShoppingCartIcon />}
              sx={{ height: '56px' }} // Para alinear con TextField
            >
              Agregar
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Carrito de Venta */}
        <Typography variant="h6" gutterBottom>Carrito de Venta</Typography>
        {cart.length === 0 ? (
          <Typography color="text.secondary">El carrito está vacío.</Typography>
        ) : (
          <TableContainer component={Paper} elevation={0} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Precio Unit.</TableCell>
                  <TableCell align="center">Cantidad</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="center">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cart.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.nombre}</TableCell>
                    <TableCell align="right">${item.precio_unitario_venta.toFixed(2)}</TableCell>
                    <TableCell align="center" sx={{minWidth: '80px'}}>
                      <TextField
                        type="number"
                        size="small"
                        variant="outlined"
                        value={item.cantidadEnCarrito}
                        onChange={(e) => handleQuantityChangeInCart(item.id, e.target.value)}
                        InputProps={{ inputProps: { min: 1, max: item.stock_actual, style: { textAlign: 'center' } } }}
                        sx={{width: '70px'}}
                      />
                    </TableCell>
                    <TableCell align="right">${item.subtotal.toFixed(2)}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleRemoveFromCart(item.id)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Total y Pago */}
        {cart.length > 0 && (
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Total: ${calculateTotal()}
            </Typography>
            <FormControl sx={{ m: 1, minWidth: 200, mb:2 }} size="small">
              <InputLabel id="payment-method-label">Método de Pago</InputLabel>
              <Select
                labelId="payment-method-label"
                value={paymentMethod}
                label="Método de Pago"
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="Efectivo">Efectivo</MenuItem>
                <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                <MenuItem value="Transferencia">Transferencia</MenuItem>
              </Select>
            </FormControl>
            {saleError && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{saleError}</Alert>}
            {saleSuccess && <Alert severity="success" sx={{ width: '100%', mb: 2 }}>{saleSuccess}</Alert>}
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleFinalizeSale}
              disabled={loadingSale || cart.length === 0 || !!saleSuccess} // Deshabilitar si está cargando, carrito vacío o ya fue exitosa
              startIcon={loadingSale ? <CircularProgress size={20} color="inherit" /> : <PointOfSaleIcon />}
            >
              {loadingSale ? 'Procesando...' : 'Finalizar Venta'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}