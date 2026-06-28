const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  itemName: {
    type: String,
    required: true,
  },
  quantitySold: {
    type: Number,
    required: true,
    min: 1,
  },
  totalRevenue: {
    type: Number,
    default: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card'],
    default: 'cash',
    set: val => val?.toLowerCase(),   // normalize before save
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Sale', saleSchema);