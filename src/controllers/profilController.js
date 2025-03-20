const Profil = require('../models/profilModel');


exports.createProfil = (req, res) => {
    const profilData = req.body;
    const profil = new Profil(profilData);
    profil.save()
        .then(savedProfil => {
            res.status(201).json({ message: "Profil créé avec succès", data: savedProfil });
        })
        .catch(error => {
            if (error.code === 11000) { 
                return res.status(400).json({ message: "Le CIN existe déjà" });
            }
            res.status(500).json({ message: "Erreur lors de la création du profil", error: error.message });
        });
};


exports.getAllProfils = (req, res) => {
    Profil.find()
        .populate('userId', 'username email') 
        .then(profils => {
            res.status(200).json({ message: "Liste des profils", data: profils });
        })
        .catch(error => {
            res.status(500).json({ message: "Erreur lors de la récupération des profils", error: error.message });
        });
};


exports.getProfilById = (req, res) => {
    Profil.findById(req.params.id)
        .populate('userId', 'username email')
        .then(profil => {
            if (!profil) {
                return res.status(404).json({ message: "Profil non trouvé" });
            }
            res.status(200).json({ message: "Profil trouvé", data: profil });
        })
        .catch(error => {
            res.status(500).json({ message: "Erreur lors de la récupération du profil", error: error.message });
        });
};


exports.updateProfil = (req, res) => {
    Profil.findByIdAndUpdate(req.params.id, req.body, {
        new: true, 
        runValidators: true 
    })
        .then(profil => {
            if (!profil) {
                return res.status(404).json({ message: "Profil non trouvé" });
            }
            res.status(200).json({ message: "Profil mis à jour avec succès", data: profil });
        })
        .catch(error => {
            if (error.code === 11000) {
                return res.status(400).json({ message: "Le CIN existe déjà" });
            }
            res.status(500).json({ message: "Erreur lors de la mise à jour du profil", error: error.message });
        });
};


exports.deleteProfil = (req, res) => {
    Profil.findByIdAndDelete(req.params.id)
        .then(profil => {
            if (!profil) {
                return res.status(404).json({ message: "Profil non trouvé" });
            }
            res.status(200).json({ message: "Profil supprimé avec succès" });
        })
        .catch(error => {
            res.status(500).json({ message: "Erreur lors de la suppression du profil", error: error.message });
        });
};

module.exports = exports;