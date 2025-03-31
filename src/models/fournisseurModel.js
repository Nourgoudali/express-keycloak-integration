const mongoose = require('mongoose');

const fournisseurSchema = new mongoose.Schema({
  id_fournisseur: { type: String, required: true, unique: true }, // Identifiant unique personnalisé
  nom: { type: String, required: true },
  email: { type: String, required: false }, // Optionnel
  address: { type: String, required: true },
  telephone: { type: String, required: false }, // Optionnel
  ville: { type: String, required: true },
  code_postal: { type: String, required: true },
});

// Ne pas ajouter d'index supplémentaire sur id_fournisseur car il est déjà marqué comme unique dans le schéma

module.exports = mongoose.model('Fournisseur', fournisseurSchema);