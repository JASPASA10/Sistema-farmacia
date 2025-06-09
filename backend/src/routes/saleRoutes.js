const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');
const authMiddleware = require('../middleware/authMiddleware'); // Asume que tienes un middleware de autenticación
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware'); // Importa el middleware de administrador

// Ruta para procesar una nueva venta (protegida)
router.post('/', authMiddleware, saleController.processSale);

// Ruta para obtener todas las ventas (protegida, solo para administradores)
router.get('/', authMiddleware, adminAuthMiddleware, saleController.getSales);

module.exports = router; 