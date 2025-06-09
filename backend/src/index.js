require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const statsRoutes = require('./routes/statsRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const saleRoutes = require('./routes/saleRoutes');
const userRoutes = require('./routes/userRoutes');

// Inicializar la app
const app = express();

// Conectar a la base de datos
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware para loggear todas las solicitudes entrantes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ message: 'API de Farmacia funcionando' });
});

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de estadísticas
app.use('/api/stats', statsRoutes);

// Rutas de productos
app.use('/api/products', productRoutes);

// Rutas de ventas
app.use('/api/sales', saleRoutes);

// Rutas de usuarios
app.use('/api/users', userRoutes);

// Importar rutas
// TODO: Agregar las rutas de autenticación, productos, ventas, etc.

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal!' });
});

const PORT = process.env.PORT || 5002; // Cambiado a 5002
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
}); 