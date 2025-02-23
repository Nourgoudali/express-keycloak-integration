const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    nom: { type: String, required: true, trim: true },
    categorie: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    prix: { type: Number, required: true },
    tva: { type: Number, required: true },
    image: { type: String, required: true, trim: true },
    stock: { type: Number, default: 0 },
    maxStock: { type: Number, default: 0 },
    minStock: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);