const Chambre = require('../models/chambreModel');

// Créer une nouvelle chambre
exports.createChambre = (req, res) => {
  const chambreData = req.body;
  const chambre = new Chambre(chambreData);
  chambre.save()
    .then(savedChambre => {
      res.status(201).json({ message: "Chambre créée avec succès", data: savedChambre });
    })
    .catch(error => {
      if (error.code === 11000) { // Erreur de duplicata (chambreNumero unique)
        return res.status(400).json({ message: "Ce numéro de chambre existe déjà" });
      }
      res.status(500).json({ message: "Erreur lors de la création de la chambre", error: error.message });
    });
};

// Récupérer toutes les chambres
exports.getAllChambres = (req, res) => {
  Chambre.find()
    .populate('occupants', 'username email') // Peupler les occupants avec des champs spécifiques
    .then(chambres => {
      res.status(200).json({ message: "Liste des chambres", data: chambres });
    })
    .catch(error => {
      res.status(500).json({ message: "Erreur lors de la récupération des chambres", error: error.message });
    });
};

// Récupérer une chambre par ID
exports.getChambreById = (req, res) => {
  Chambre.findById(req.params.id)
    .populate('occupants', 'username email')
    .then(chambre => {
      if (!chambre) {
        return res.status(404).json({ message: "Chambre non trouvée" });
      }
      res.status(200).json({ message: "Chambre trouvée", data: chambre });
    })
    .catch(error => {
      res.status(500).json({ message: "Erreur lors de la récupération de la chambre", error: error.message });
    });
};

// Mettre à jour une chambre
exports.updateChambre = (req, res) => {
  Chambre.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Retourne le document mis à jour
    runValidators: true // Valide les champs selon le schéma
  })
    .then(chambre => {
      if (!chambre) {
        return res.status(404).json({ message: "Chambre non trouvée" });
      }
      res.status(200).json({ message: "Chambre mise à jour avec succès", data: chambre });
    })
    .catch(error => {
      if (error.code === 11000) {
        return res.status(400).json({ message: "Ce numéro de chambre existe déjà" });
      }
      res.status(500).json({ message: "Erreur lors de la mise à jour de la chambre", error: error.message });
    });
};


exports.deleteChambre = (req, res) => {
  Chambre.findByIdAndDelete(req.params.id)
    .then(chambre => {
      if (!chambre) {
        return res.status(404).json({ message: "Chambre non trouvée" });
      }
      res.status(200).json({ message: "Chambre supprimée avec succès" });
    })
    .catch(error => {
      res.status(500).json({ message: "Erreur lors de la suppression de la chambre", error: error.message });
    });
};


exports.addOccupant = (req, res) => {
  const { occupantId } = req.body; 
  Chambre.findById(req.params.id)
    .then(chambre => {
      if (!chambre) {
        return res.status(404).json({ message: "Chambre non trouvée" });
      }
      if (chambre.occupants.length >= chambre.maxOccupants) {
        return res.status(400).json({ message: "La chambre est déjà pleine" });
      }
      if (chambre.occupants.includes(occupantId)) {
        return res.status(400).json({ message: "Cet occupant est déjà dans la chambre" });
      }
      chambre.occupants.push(occupantId);
      chambre.status = chambre.occupants.length >= chambre.maxOccupants ? 'full' : 'available';
      return chambre.save();
    })
    .then(updatedChambre => {
      res.status(200).json({ message: "Occupant ajouté avec succès", data: updatedChambre });
    })
    .catch(error => {
      res.status(500).json({ message: "Erreur lors de l'ajout de l'occupant", error: error.message });
    });
};


exports.removeOccupant = (req, res) => {
  const { occupantId } = req.body; 
  Chambre.findById(req.params.id)
    .then(chambre => {
      if (!chambre) {
        return res.status(404).json({ message: "Chambre non trouvée" });
      }
      const occupantIndex = chambre.occupants.indexOf(occupantId);
      if (occupantIndex === -1) {
        return res.status(400).json({ message: "Cet occupant n'est pas dans la chambre" });
      }
      chambre.occupants.splice(occupantIndex, 1);
      chambre.status = chambre.occupants.length === 0 ? 'available' : chambre.occupants.length >= chambre.maxOccupants ? 'full' : 'available';
      return chambre.save();
    })
    .then(updatedChambre => {
      res.status(200).json({ message: "Occupant retiré avec succès", data: updatedChambre });
    })
    .catch(error => {
      res.status(500).json({ message: "Erreur lors du retrait de l'occupant", error: error.message });
    });
};

module.exports = exports;