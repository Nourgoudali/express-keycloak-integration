const mongoose = require('mongoose');

const chambreSchema = new mongoose.Schema({
  chambreNumero: { type: String, required: true, unique: true, trim: true },
  capacity: { type: Number, required: true },
  occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxOccupants: { type: Number, required: true },
  status: { type: String, required: true, enum: ['available', 'full'] ,default: 'available' },
}, { timestamps: true });

module.exports = mongoose.model('Chambre', chambreSchema);
