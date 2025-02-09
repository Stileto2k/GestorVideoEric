// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Canviat a 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';

// Crear una instància de root amb createRoot
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderitzar l'aplicació
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
