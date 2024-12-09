// src/index.js
import 'bootstrap/dist/css/bootstrap.min.css'; // Estilos do Bootstrap
import '@fortawesome/fontawesome-free/css/all.min.css';

import './index.css'; // Seus estilos globais
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
