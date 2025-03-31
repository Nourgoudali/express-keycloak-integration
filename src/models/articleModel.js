const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  categorie: { type: String, required: true, enum: ['Epicerie', 'Fruits et Légumes', 'Viandes & Boeufs', 'Poisson', 'Autres'] },
  produit: { type: String, required: true },
  quantite: { type: Number, required: true },
  unite: { type: String, required: true, enum: ["kg","g","l", "unite","boite","paquet"] },    
  minStock: { type: Number, default: 0 },
  maxStock: { type: Number, default: 100 },
  statut: { type: String, required: true, enum: ['En stock', 'Faible stock'] },
});

module.exports = mongoose.model('Article', articleSchema);