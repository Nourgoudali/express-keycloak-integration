const mongoose = require('mongoose');
const getCurrentSchoolYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); 
  
  
  if (month >= 8) {
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`;
};
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
  annee_scolaire: { 
    type: String,
    required: true,
    default: getCurrentSchoolYear
  }
}, { timestamps: true });

module.exports = mongoose.model('Reclamation', reclamationSchema);