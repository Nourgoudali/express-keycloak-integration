const express = require('express');
const router = express.Router();
const factureController = require('../controllers/factureController');
const multer = require('multer');

// Configuration de multer pour l'upload d'images
const upload = multer({ storage: multer.memoryStorage() });

// Supprimer la route de création qui n'est plus nécessaire car les factures sont générées automatiquement
// dans les contrôleurs d'achat et de consommation
// router.post('/', upload.single('image'), factureController.createFacture);

// Routes existantes
router.get('/', factureController.getAllFactures);
router.get('/:id', factureController.getFactureById);

// Ajouter une route pour générer un PDF pour une facture spécifique
router.get('/:id/pdf', factureController.generateFacturePDF);

// Routes pour la gestion des images
router.post('/:id/image', upload.single('image'), factureController.importFactureImage);
router.delete('/:id/image', factureController.deleteFactureImage);

module.exports = router;