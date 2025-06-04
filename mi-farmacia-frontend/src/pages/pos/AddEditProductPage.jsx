import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx'; // O AuthContext.jsx

// Servicios
import { createProductAPI, getProductByIdAPI, updateProductAPI } from '../../services/ProductService'; // O productService.js
import { getAllCategoriesAPI } from '../../services/categoryService';
import { getAllSuppliersAPI } from '../../services/supplierService';

// Importaciones de Material-UI
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid'; // Usaremos Grid v2 si es posible
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const initialFormState = {
  codigo_barras: '',
  nombre: '',
  descripcion: '',
  precio_venta: '',
  costo_compra: '',
  stock_actual: '',
  stock_minimo: '',
  fecha_caducidad: '',
  id_categoria: '',
  id_proveedor_preferido: '',
  requiere_receta: false,
};

// Estado inicial para los errores de validación
const initialFormErrors = {
  codigo_barras: '',
  nombre: '',
  precio_venta: '',
  stock_actual: '',
  stock_minimo: '',
  id_categoria: '',
  // Puedes añadir más campos aquí si necesitas validar otros
};

export default function AddEditProductPage() {
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [serverError, setServerError] = useState(null); // Para errores generales del servidor
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { id: productId } = useParams();
  const isEditMode = Boolean(productId);

  useEffect(() => {
    const fetchData = async () => {
      setPageLoading(true);
      setServerError(null);
      try {
        const [categoriesData, suppliersData] = await Promise.all([
          getAllCategoriesAPI(),
          getAllSuppliersAPI(),
        ]);
        setCategories(categoriesData || []);
        setSuppliers(suppliersData || []);

        if (isEditMode && productId) {
          const productData = await getProductByIdAPI(productId);
          if (productData.fecha_caducidad) {
            productData.fecha_caducidad = new Date(productData.fecha_caducidad).toISOString().split('T')[0];
          }
          setFormData({
            codigo_barras: productData.codigo_barras || '',
            nombre: productData.nombre || '',
            descripcion: productData.descripcion || '',
            precio_venta: productData.precio_venta?.toString() || '', // Convertir a string para el input
            costo_compra: productData.costo_compra?.toString() || '',
            stock_actual: productData.stock_actual?.toString() || '',
            stock_minimo: productData.stock_minimo?.toString() || '',
            fecha_caducidad: productData.fecha_caducidad || '',
            id_categoria: productData.id_categoria || '',
            id_proveedor_preferido: productData.id_proveedor_preferido || '',
            requiere_receta: productData.requiere_receta || false,
          });
        }
      } catch (err) {
        setServerError('Error al cargar datos: ' + (err.message || 'Error desconocido'));
      } finally {
        setPageLoading(false);
      }
    };
    fetchData();
  }, [productId, isEditMode]);

  // Función de validación
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'codigo_barras':
        if (!value.trim()) error = 'El código de barras es requerido.';
        break;
      case 'nombre':
        if (!value.trim()) error = 'El nombre del producto es requerido.';
        break;
      case 'precio_venta':
        if (!value) error = 'El precio de venta es requerido.';
        else if (isNaN(parseFloat(value)) || parseFloat(value) < 0) error = 'El precio debe ser un número positivo.';
        break;
      case 'stock_actual':
        if (!value) error = 'El stock actual es requerido.';
        else if (isNaN(parseInt(value, 10)) || parseInt(value, 10) < 0) error = 'El stock debe ser un número entero positivo.';
        break;
      case 'stock_minimo':
        if (!value) error = 'El stock mínimo es requerido.';
        else if (isNaN(parseInt(value, 10)) || parseInt(value, 10) < 0) error = 'El stock mínimo debe ser un número entero positivo.';
        break;
      case 'id_categoria':
        if (!value) error = 'La categoría es requerida.';
        break;
      case 'costo_compra':
        if (value && (isNaN(parseFloat(value)) || parseFloat(value) < 0)) error = 'El costo debe ser un número positivo.';
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData((prevData) => ({
      ...prevData,
      [name]: newValue,
    }));
    // Validar el campo al cambiar si ya tiene un error o si queremos validación "en vivo"
    if (formErrors[name] || name in initialFormErrors) { // Validar si el campo es uno de los que tienen validación definida
        setFormErrors(prevErrors => ({
            ...prevErrors,
            [name]: validateField(name, newValue)
        }));
    }
  };
  
  // Validar un campo cuando pierde el foco (onBlur)
  const handleBlur = (event) => {
    const { name, value } = event.target;
    if (name in initialFormErrors) { // Solo validar campos que tienen reglas definidas en initialFormErrors
        setFormErrors(prevErrors => ({
            ...prevErrors,
            [name]: validateField(name, value)
        }));
    }
  };


  const validateForm = () => {
    let newErrors = {};
    let isValid = true;
    Object.keys(initialFormErrors).forEach(key => { // Iterar sobre los campos que queremos validar
        const error = validateField(key, formData[key]);
        if (error) {
            newErrors[key] = error;
            isValid = false;
        }
    });
    setFormErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError(null);
    setSuccessMessage('');

    if (!validateForm()) {
      return; // No enviar si hay errores de validación en el frontend
    }

    setLoading(true);
    const dataToSubmit = {
      ...formData,
      precio_venta: parseFloat(formData.precio_venta),
      costo_compra: formData.costo_compra ? parseFloat(formData.costo_compra) : null,
      stock_actual: parseInt(formData.stock_actual, 10),
      stock_minimo: parseInt(formData.stock_minimo, 10),
      id_categoria: parseInt(formData.id_categoria, 10),
      id_proveedor_preferido: formData.id_proveedor_preferido ? parseInt(formData.id_proveedor_preferido, 10) : null,
      fecha_caducidad: formData.fecha_caducidad || null,
    };

    try {
      if (isEditMode) {
        await updateProductAPI(productId, dataToSubmit);
        setSuccessMessage('¡Producto actualizado exitosamente!');
      } else {
        await createProductAPI(dataToSubmit);
        setSuccessMessage('¡Producto agregado exitosamente!');
        setFormData(initialFormState); // Limpiar formulario
        setFormErrors(initialFormErrors); // Limpiar errores
      }
      setTimeout(() => {
        navigate('/pos/inventario');
      }, 1500);
    } catch (err) {
      console.error('Error al guardar producto:', err);
      // Si el error del backend tiene un campo 'field', lo usamos para el error del formulario
      if (err.field && err.field in initialFormErrors) {
        setFormErrors(prev => ({...prev, [err.field]: err.message}));
      } else {
        setServerError(err.message || (isEditMode ? 'Error al actualizar el producto.' : 'Error al agregar el producto.'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress /> <Typography sx={{ ml: 2 }}>Cargando...</Typography>
      </Box>
    );
  }

  // Comprobar si el formulario es válido para habilitar/deshabilitar el botón
  const isFormValid = !Object.values(formErrors).some(error => error !== '');

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/pos/inventario')} sx={{ mb: 2 }}>
          Volver al Listado
        </Button>
        <Typography component="h1" variant="h5" color="primary" gutterBottom sx={{ textAlign: 'center', mb:3 }}>
          {isEditMode ? 'Editar Producto' : 'Agregar Nuevo Producto'}
        </Typography>

        {serverError && <Alert severity="error" sx={{ mb: 2 }}>{serverError}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}> {/* Reducir spacing para que quepa mejor */}
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="codigo_barras"
                label="Código de Barras"
                name="codigo_barras"
                value={formData.codigo_barras}
                onChange={handleChange}
                onBlur={handleBlur} // Validar al perder foco
                error={!!formErrors.codigo_barras}
                helperText={formErrors.codigo_barras}
                disabled={isEditMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="nombre"
                label="Nombre del Producto"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!formErrors.nombre}
                helperText={formErrors.nombre}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="descripcion"
                label="Descripción"
                name="descripcion"
                multiline
                rows={2} // Reducir rows
                value={formData.descripcion}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                id="precio_venta"
                label="Precio Venta"
                name="precio_venta"
                value={formData.precio_venta}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!formErrors.precio_venta}
                helperText={formErrors.precio_venta}
                InputProps={{ inputProps: { min: 0, step: "0.01" } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                id="costo_compra"
                label="Costo Compra"
                name="costo_compra"
                value={formData.costo_compra}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!formErrors.costo_compra}
                helperText={formErrors.costo_compra}
                InputProps={{ inputProps: { min: 0, step: "0.01" } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                id="stock_actual"
                label="Stock Actual"
                name="stock_actual"
                value={formData.stock_actual}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!formErrors.stock_actual}
                helperText={formErrors.stock_actual}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                id="stock_minimo"
                label="Stock Mínimo"
                name="stock_minimo"
                value={formData.stock_minimo}
                onChange={handleChange}
                onBlur={handleBlur}
                error={!!formErrors.stock_minimo}
                helperText={formErrors.stock_minimo}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!formErrors.id_categoria}>
                <InputLabel id="id_categoria-label">Categoría</InputLabel>
                <Select
                  labelId="id_categoria-label"
                  id="id_categoria"
                  name="id_categoria"
                  value={formData.id_categoria}
                  label="Categoría"
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <MenuItem value=""><em>Seleccione</em></MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.nombre}</MenuItem>
                  ))}
                </Select>
                {formErrors.id_categoria && <Typography color="error" variant="caption" sx={{ml:1.5, mt:0.5}}>{formErrors.id_categoria}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="id_proveedor_preferido-label">Proveedor Preferido</InputLabel>
                <Select
                  labelId="id_proveedor_preferido-label"
                  id="id_proveedor_preferido"
                  name="id_proveedor_preferido"
                  value={formData.id_proveedor_preferido}
                  label="Proveedor Preferido"
                  onChange={handleChange}
                >
                  <MenuItem value=""><em>Ninguno</em></MenuItem>
                  {suppliers.map((sup) => (
                    <MenuItem key={sup.id} value={sup.id}>{sup.nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                id="fecha_caducidad"
                label="Fecha Caducidad"
                name="fecha_caducidad"
                value={formData.fecha_caducidad}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: {xs: 'flex-start', sm: 'center'} }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.requiere_receta}
                    onChange={handleChange}
                    name="requiere_receta"
                  />
                }
                label="Requiere Receta"
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !isFormValid} // Deshabilitar si carga o si el formulario no es válido
                sx={{ minWidth: 150 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : (isEditMode ? 'Actualizar Producto' : 'Guardar Producto')}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}