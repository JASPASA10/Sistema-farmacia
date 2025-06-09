const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

// Middleware para manejar errores de validación
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Ruta para iniciar sesión con validación
router.post(
  '/login',
  [
    check('email', 'Por favor, incluye un email válido').isEmail(),
    check('password', 'La contraseña es requerida').not().isEmpty(),
  ],
  validate,
  authController.login
);

// Ruta para registrar usuario con validación
router.post(
  '/register',
  [
    check('name', 'El nombre es requerido').not().isEmpty(),
    check('email', 'Por favor, incluye un email válido').isEmail(),
    check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  ],
  validate,
  authController.register
);

// Ruta para verificar token
router.get('/verify', authController.verifyToken);

module.exports = router; 