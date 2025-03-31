const mongoose = require('mongoose');

/**
 * Fonction pour calculer l'année scolaire actuelle automatiquement.
 * - Si on est en septembre ou après, l'année est "AAAA/AAAA+1".
 * - Sinon, c'est "AAAA-1/AAAA".
 */
const getCurrentSchoolYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0 = Janvier, 8 = Septembre

  if (month >= 8) { // Septembre ou après
    return `${year}/${year + 1}`;
  }
  return `${year - 1}/${year}`;
};

const anneeScolaireSchema = new mongoose.Schema({
  annee: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => getCurrentSchoolYear()
  },
  libelle: { 
    type: String, 
    required: true, 
    unique: true,
    default: () => getCurrentSchoolYear()
  },
  active: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

/**
 * Avant de sauvegarder une année scolaire en active, désactiver les autres.
 */
anneeScolaireSchema.pre('save', async function(next) {
  if (this.active) {
    await this.constructor.updateMany({ _id: { $ne: this._id } }, { active: false });
  }
  next();
});

/**
 * Récupérer l'année scolaire active, ou en créer une si elle n'existe pas.
 * Met également à jour automatiquement l'année active selon la date système.
 */
anneeScolaireSchema.statics.getActiveYear = async function() {
  const currentYear = getCurrentSchoolYear();
  
  // Vérifier si l'année scolaire actuelle existe déjà
  let currentYearDoc = await this.findOne({ annee: currentYear });
  
  // Si l'année scolaire actuelle n'existe pas, la créer
  if (!currentYearDoc) {
    currentYearDoc = await this.create({
      annee: currentYear,
      libelle: currentYear,
      active: true // Cette nouvelle année sera automatiquement active
    });
    return currentYearDoc;
  }
  
  // Vérifier si l'année active correspond à l'année scolaire actuelle
  const activeYear = await this.findOne({ active: true });
  
  // Si aucune année n'est active ou si l'année active n'est pas l'année scolaire actuelle
  if (!activeYear || activeYear.annee !== currentYear) {
    // Mettre à jour pour que l'année scolaire actuelle soit active
    await this.updateMany({}, { active: false }); // Désactiver toutes les années
    await this.updateOne({ annee: currentYear }, { active: true }); // Activer l'année courante
    
    return await this.findOne({ annee: currentYear });
  }
  
  return activeYear;
};

/**
 * Récupérer toutes les années scolaires disponibles, triées par ordre décroissant.
 */
anneeScolaireSchema.statics.getAllYears = async function() {
  return await this.find().sort({ annee: -1 }); // Trier par année décroissante
};

module.exports = mongoose.model('AnneeScolaire', anneeScolaireSchema);
