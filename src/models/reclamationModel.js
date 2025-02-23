const mongoose = require('mongoose');

const reclamationSchema = new mongoose.Schema({
  reclamant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  categorie: { type: String, required: true,enum:[ 
    "Problèmes de Chambre",
    "Repas",
    "Hygiène",
    "Sécurité",
    "Infrastructure",] },
  statut: { type: String, enum: ['En cours', 'Résolu', 'Rejeté'], default: 'En cours' },
  priorite: { type: String, enum: ['Haute', 'Moyenne', 'Basse'], default: 'Moyenne' },
}, { timestamps: true });

module.exports = mongoose.model('Reclamation', reclamationSchema);