const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
});

const SaleSchema = new mongoose.Schema({
  items: [
    SaleItemSchema
  ],
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  saleDate: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

module.exports = mongoose.model('Sale', SaleSchema); 