const mongoose = require('mongoose');

const fournisseurSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Clé primaire personnalisée si vous utilisez des IDs String
  nom: { type: String, required: true },
  email: { type: String, required: false }, // Optionnel
  address: { type: String, required: true },
  telephone: { type: String, required: false }, // Optionnel
  ville: { type: String, required: true },
  code_postal: { type: String, required: true },
}, { _id: false }); // Désactiver l'_id par défaut si vous utilisez un _id personnalisé

module.exports = mongoose.model('Fournisseur', fournisseurSchema);