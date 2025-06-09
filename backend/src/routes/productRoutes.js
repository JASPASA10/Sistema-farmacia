const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Middleware para manejar errores de validación (repetido para claridad, se podría unificar si ya existe en otro lado)
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Rutas para productos
router.get('/', authMiddleware, getProducts);
router.get('/:id', authMiddleware, getProductById);

router.post(
  '/',
  authMiddleware,
  adminAuthMiddleware, // Solo administradores pueden crear productos
  [
    check('name', 'El nombre del producto es requerido').not().isEmpty(),
    check('price', 'El precio debe ser un número válido').isFloat({ gt: 0 }),
    check('stock', 'El stock debe ser un número entero válido').isInt({ gt: -1 }),
    check('category', 'La categoría es requerida').not().isEmpty(),
  ],
  validate,
  createProduct
);

router.put(
  '/:id',
  authMiddleware,
  adminAuthMiddleware, // Solo administradores pueden actualizar productos
  [
    check('name', 'El nombre del producto es requerido').optional().not().isEmpty(),
    check('price', 'El precio debe ser un número válido').optional().isFloat({ gt: 0 }),
    check('stock', 'El stock debe ser un número entero válido').optional().isInt({ gt: -1 }),
    check('category', 'La categoría es requerida').optional().not().isEmpty(),
  ],
  validate,
  updateProduct
);

router.delete('/:id', authMiddleware, adminAuthMiddleware, deleteProduct);

module.exports = router; 