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
const achatSchema = new mongoose.Schema({
  id_fournisseur: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur', required: true },
  id_article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  quantite: { type: Number, required: true },
  prix: { type: Number, required: true },
  date_expiration: { type: Date, required: true },
  stock_reel: { type: Number, default: 0 },
  annee_scolaire: { 
    type: String,
    required: true,
    default: getCurrentSchoolYear
  }
});

module.exports = mongoose.model('Achat', achatSchema);