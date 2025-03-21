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
const consommationSchema = new mongoose.Schema({
  id_article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  quantite: { type: Number, required: true },
  type: {type:String, required: true,enum: ['utilisation', 'endommage', 'perime', 'vol', 'don']},
  date_consommation: { type: Date, default: Date.now },
  annee_scolaire: { 
    type: String,
    required: true,
    default: getCurrentSchoolYear
  }
});

module.exports = mongoose.model('Consommation', consommationSchema);