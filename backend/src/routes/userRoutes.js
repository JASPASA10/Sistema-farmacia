const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware'); // Asume que tienes un middleware de autenticación
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware'); // Importa el middleware de administrador
// const adminAuthMiddleware = require('../middleware/adminAuthMiddleware'); // Asume que tienes un middleware para verificar roles de administrador

// Ruta para obtener todos los usuarios (protegida por admin)
router.get('/', authMiddleware, adminAuthMiddleware, userController.getUsers);

// Ruta para actualizar un usuario (protegida por admin)
router.put('/:id', authMiddleware, adminAuthMiddleware, userController.updateUser);

// Ruta para eliminar un usuario (protegida por admin)
router.delete('/:id', authMiddleware, adminAuthMiddleware, userController.deleteUser);

module.exports = router; 