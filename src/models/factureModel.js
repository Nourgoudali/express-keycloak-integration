const mongoose = require('mongoose');

const factureSchema = new mongoose.Schema({
  N_facture: {
    type: String,
    unique: true,
    required: true
  },
  type: { 
    type: String, 
    enum: ['achat', 'consommation'], 
    required: true 
  },
  id_fournisseur: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Fournisseur', 
    required: function() { return this.type === 'achat'; } 
  },
  articlesC: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Consommation', 
  }, 
  articlesA: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Achat',
    required: function() { return this.type === 'achat'; } 
  }], 
  date: { type: Date, default: Date.now },
  montant_total: { type: Number, default: 0 },
  image_path: {
    type: [String],
    default: []
  },
  annee: { 
    type: String,
    ref: 'AnneeScolaire',
    required: true
  }
});

// Fonction statique pour générer un numéro de facture unique
factureSchema.statics.generateFactureNumber = async function (type) {
  const prefix = type === "achat" ? "A" : "C";

  // Trouver la dernière facture du même type
  const lastFacture = await this.findOne({ type })
    .sort({ N_facture: -1 })
    .exec();

  let newNumber = "001";
  if (lastFacture && lastFacture.N_facture) {
    const lastNumber = parseInt(lastFacture.N_facture.substring(1)); // Extraire le numéro
    newNumber = String(lastNumber + 1).padStart(3, "0"); // Incrémenter
  }

  return `${prefix}${newNumber}`;
};

// Middleware pour générer N_facture avant de sauvegarder
factureSchema.pre("save", async function (next) {
  if (!this.N_facture) {
    this.N_facture = await this.constructor.generateFactureNumber(this.type);
  }
  next();
});

module.exports = mongoose.model('Facture', factureSchema);
