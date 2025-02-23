const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['supplies', 'equipment', 'food', 'sanitary'] },
  quantity: { type: Number, required: true },
  supplier: { type: String, trim: true },
  reorderLevel: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Stock', stockSchema);
