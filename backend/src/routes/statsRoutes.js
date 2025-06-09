const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/statsController');

// Ruta para obtener estadísticas del dashboard
router.get('/dashboard', getDashboardStats);

module.exports = router; 