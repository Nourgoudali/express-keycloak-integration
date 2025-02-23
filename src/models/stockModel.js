const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  produits: [{type: mongoose.Schema.Types.ObjectId, ref: 'Article'}],
  categorie: { type: String, required: true, enum: ['fournitures', 'équipement', 'alimentaire', 'sanitaire'] },
  quantite: { type: Number, required: true },
  fournisseur: { type: String, trim: true },
  niveauReapprovisionnement: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Stock', stockSchema);