const mongoose = require('mongoose');

const preInscriptionSchema = new mongoose.Schema({
  candidat: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  programme: { type: String, required: true },
  annee: { type: Number, required: true },
  statut: { type: String, enum: ['En attente', 'Approuvé', 'Rejeté'], default: 'En attente' },
  besoinsSpecifiques: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('PreInscription', preInscriptionSchema);