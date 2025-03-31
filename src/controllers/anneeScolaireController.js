const AnneeScolaire = require('../models/anneeScolaireModel');

/**
 * Récupérer l'année scolaire active
 * Cette fonctionnalité vérifie et met à jour automatiquement l'année active selon la date actuelle
 */
exports.getActiveYear = async (req, res) => {
  try {
    const activeYear = await AnneeScolaire.getActiveYear();
    
    res.status(200).json({
      success: true,
      activeYear: activeYear,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération de l'année scolaire active", 
      error: error.message 
    });
  }
};

/**
 * Récupérer toutes les années scolaires et afficher l'année active.
 */
exports.getAllYears = async (req, res) => {
  try {
    // S'assurer que l'année active est correctement mise à jour avant de récupérer les données
    await AnneeScolaire.getActiveYear();
    
    // Récupérer toutes les années scolaires triées par ordre décroissant
    const years = await AnneeScolaire.getAllYears();
    
    // Déterminer l'année active parmi les résultats
    const activeYear = years.find(y => y.active);
    
    res.status(200).json({
      success: true,
      activeYear: activeYear,
      years: years,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération des années scolaires", 
      error: error.message 
    });
  }
};

/**
 * Mettre à jour dynamiquement l'année scolaire active
 * Cette route peut être appelée par un cron job ou lors de l'initialisation de l'application
 */
exports.updateActiveYear = async (req, res) => {
  try {
    const activeYear = await AnneeScolaire.getActiveYear();
    
    res.status(200).json({
      success: true,
      message: "L'année scolaire active a été mise à jour",
      activeYear: activeYear,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la mise à jour de l'année scolaire active", 
      error: error.message 
    });
  }
};
