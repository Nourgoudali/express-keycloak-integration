const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  photo: String,
  categorie: { type: String, required: true }, 
  unite: { type: String, required: true },    
  minStock: { type: Number, default: 0 },
  maxStock: { type: Number, default: 100 },
});

module.exports = mongoose.model('Article', articleSchema);