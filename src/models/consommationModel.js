const mongoose = require('mongoose');

const consommationSchema = new mongoose.Schema({
  id_article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
  quantite: { type: Number, required: true },
  type: {type:String, required: true,enum: ['utilisation', 'endommage', 'perime', 'vol', 'don']},
  date_consommation: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Consommation', consommationSchema);