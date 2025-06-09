const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Procesar una nueva venta
exports.processSale = async (req, res) => {
  try {
    const { items, total } = req.body;
    const userId = req.user.userId; // Asumiendo que el middleware de autenticación adjunta el ID del usuario

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'La venta debe contener al menos un producto.' });
    }

    // Verificar el stock de cada producto y actualizarlo
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Producto con ID ${item.productId} no encontrado.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Stock insuficiente para el producto ${product.name}. Stock disponible: ${product.stock}` });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    const newSale = new Sale({
      items,
      total,
      user: userId,
    });

    await newSale.save();

    res.status(201).json({ message: 'Venta procesada exitosamente', sale: newSale });
  } catch (error) {
    console.error('Error al procesar la venta:', error);
    res.status(500).json({ message: 'Error interno del servidor al procesar la venta' });
  }
};

// Obtener todas las ventas (opcional, para reportes)
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find().populate('user', 'name email').populate('items.productId', 'name price');
    res.status(200).json(sales);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener ventas' });
  }
}; 