const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    index: true
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  supplier: String,
  minStock: {
    type: Number,
    default: 5
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
    index: true
  }
});

productSchema.plugin(mongoosePaginate);

productSchema.index({ stock: 1, minStock: 1 });

module.exports = mongoose.model('Product', productSchema); 