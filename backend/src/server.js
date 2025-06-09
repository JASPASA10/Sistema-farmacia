const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Middleware para loggear todas las solicitudes entrantes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', (req, res, next) => {
  console.log(`Solicitud recibida para /api/auth/${req.url} con método ${req.method}`);
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/farmacia')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Puerto
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
}); 