const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  sellingPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  photo: { type: String },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// ── Performance Index ─────────────────────────────────────────────────────────
// Accelerates GET /api/items (filter by shopId, sort newest-first by createdAt)
itemSchema.index({ shopId: 1, createdAt: -1 });

module.exports = mongoose.model('Item', itemSchema);
