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
const factureSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['achat', 'consommation'], 
    required: true 
  },
  id_fournisseur: { 
    type: String, 
    ref: 'Fournisseur', 
    required: function() { return this.type === 'achat'; } 
  },
  id_article: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Article', 
    required: function() { return this.type === 'consommation'; } 
  },
  achats: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Achat' 
  }], 
  consommations: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Consommation' 
  }], 
  date: { type: Date, default: Date.now },
  montant_total: { type: Number, default: 0 },
  image_path: { type: String } ,
  annee_scolaire: { 
    type: String,
    required: true,
    default: getCurrentSchoolYear
  }
});

module.exports = mongoose.model('Facture', factureSchema);