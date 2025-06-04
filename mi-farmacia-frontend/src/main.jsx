//import { StrictMode } from 'react'
//import { createRoot } from 'react-dom/client'
//import './styles/index.css'
//import App from './App.jsx'
//import { AuthProvider } from './contexts/AuthContext.jsx';


// ============== ARCHIVO: src/main.jsx ==============
// (Asegúrate que este archivo envuelva App con AuthProvider y Router)
// (Debe estar en: mi-farmacia-frontend/src/main.jsx)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx'; // Ajusta si tu archivo es AuthContext.jsx
//import './index.css'; // Si tienes estilos globales

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> 
      <App />
    </AuthProvider>
  </React.StrictMode>
);
