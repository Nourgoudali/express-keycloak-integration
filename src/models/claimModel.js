const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  reclamant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  categorie: { type: String, required: true },
  statut: { type: String, enum: ['En cours', 'Résolu', 'Rejeté'], default: 'En cours' },
  priorite: { type: String, enum: ['Haute', 'Moyenne', 'Basse'], default: 'Moyenne' },
}, { timestamps: true });

module.exports = mongoose.model('Claim', claimSchema);