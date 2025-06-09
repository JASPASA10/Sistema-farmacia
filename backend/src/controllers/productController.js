const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// Obtener todos los productos con paginación, búsqueda y filtrado
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, searchTerm, category, minStock } = req.query;
    const query = {};

    if (searchTerm) {
      query.$or = [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (minStock !== undefined) {
      query.stock = { $lte: parseInt(minStock) };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { name: 1 }, // Opcional: ordenar por nombre por defecto
    };

    const products = await Product.paginate(query, options);
    console.log('Respuesta de Product.paginate:', products);
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

// Obtener un producto por ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el producto' });
  }
};

// Crear un nuevo producto
const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error al crear el producto:', error);
    res.status(400).json({ message: 'Error al crear el producto' });
  }
};

// Actualizar un producto
const updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // runValidators para aplicar validaciones del esquema
    );
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(400).json({ message: 'Error al actualizar el producto' });
  }
};

// Eliminar un producto
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
}; 