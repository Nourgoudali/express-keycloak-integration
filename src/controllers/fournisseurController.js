const Fournisseur = require('../models/fournisseurModel');

// Créer un nouveau fournisseur
exports.createFournisseur = async (req, res) => {
  try {
    console.log('Données reçues pour créer un fournisseur:', req.body);
    
    // Créer une copie des données
    const fournisseurData = { ...req.body };
    
    // S'assurer que tous les champs requis sont présents
    const requiredFields = ['nom', 'address', 'ville', 'code_postal'];
    const missingFields = requiredFields.filter(field => !fournisseurData[field]);
    
    if (missingFields.length > 0) {
      console.log('Champs manquants:', missingFields);
      return res.status(400).json({ 
        error: `Les champs suivants sont obligatoires: ${missingFields.join(', ')}` 
      });
    }
    
    // Générer un ID de fournisseur unique si non fourni
    if (!fournisseurData.id_fournisseur) {
      const prefix = fournisseurData.nom ? fournisseurData.nom.substring(0, 3).toUpperCase() : 'FRN';
      fournisseurData.id_fournisseur = `${prefix}-${Date.now()}`;
      console.log('ID fournisseur généré:', fournisseurData.id_fournisseur);
    }
    
    // Créer et sauvegarder le nouveau fournisseur
    const newFournisseur = new Fournisseur(fournisseurData);
    console.log('Nouvel objet fournisseur créé:', newFournisseur);
    
    const savedFournisseur = await newFournisseur.save();
    console.log('Fournisseur sauvegardé avec succès:', savedFournisseur);
    
    res.status(201).json({
      success: true,
      data: savedFournisseur,
      message: 'Fournisseur créé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création du fournisseur:', error);
    
    // Gérer les erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      console.log('Erreurs de validation:', messages);
      return res.status(400).json({
        error: messages.join(', ')
      });
    }
    
    // Gérer les erreurs de duplication (comme email ou id_fournisseur dupliqué)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      console.log('Erreur de duplication:', field);
      return res.status(400).json({
        error: `Ce ${field} existe déjà dans la base de données`
      });
    }
    
    res.status(500).json({
      error: 'Erreur lors de la création du fournisseur',
      details: error.message
    });
  }
};

// Récupérer tous les fournisseurs
exports.getAllFournisseurs = async (req, res) => {
  try {
    const fournisseurs = await Fournisseur.find();
    res.status(200).json({
      success: true,
      count: fournisseurs.length,
      data: fournisseurs
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des fournisseurs:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération des fournisseurs',
      details: error.message
    });
  }
};

// Récupérer un fournisseur par son ID
exports.getFournisseurById = async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findOne({ id_fournisseur: req.params.id });
    
    if (!fournisseur) {
      return res.status(404).json({
        error: 'Fournisseur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: fournisseur
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du fournisseur:', error);
    res.status(500).json({
      error: 'Erreur lors de la récupération du fournisseur',
      details: error.message
    });
  }
};

// Mettre à jour un fournisseur
exports.updateFournisseur = async (req, res) => {
  try {
    console.log('Données reçues pour mettre à jour un fournisseur:', req.params.id, req.body);
    
    // Options pour retourner le document mis à jour
    const options = { new: true, runValidators: true };
    
    const fournisseur = await Fournisseur.findOneAndUpdate(
      { id_fournisseur: req.params.id },
      req.body,
      options
    );
    
    if (!fournisseur) {
      return res.status(404).json({
        error: 'Fournisseur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      data: fournisseur,
      message: 'Fournisseur mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du fournisseur:', error);
    
    // Gérer les erreurs de validation
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        error: messages.join(', ')
      });
    }
    
    res.status(500).json({
      error: 'Erreur lors de la mise à jour du fournisseur',
      details: error.message
    });
  }
};

// Supprimer un fournisseur
exports.deleteFournisseur = async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findOneAndDelete({ id_fournisseur: req.params.id });
    
    if (!fournisseur) {
      return res.status(404).json({
        error: 'Fournisseur non trouvé'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Fournisseur supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du fournisseur:', error);
    res.status(500).json({
      error: 'Erreur lors de la suppression du fournisseur',
      details: error.message
    });
  }
};