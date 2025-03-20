const mongoose = require('mongoose');

const achatSchema = new mongoose.Schema({
  id_fournisseur: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur', required: true },
  id_article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  quantite: { type: Number, required: true },
  prix: { type: Number, required: true },
  date_expiration: { type: Date, required: true },
  stock_reel: { type: Number, default: 0 },
});

module.exports = mongoose.model('Achat', achatSchema);