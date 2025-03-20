const mongoose = require('mongoose');

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
  image_path: { type: String } 
});

module.exports = mongoose.model('Facture', factureSchema);