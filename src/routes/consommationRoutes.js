const express = require('express');
const router = express.Router();
const consommationController = require('../controllers/consommationController');
const multer = require('multer');

// Configuration de multer pour l'upload d'images
const upload = multer({ storage: multer.memoryStorage() });

// Route pour créer une consommation avec possibilité d'uploader une image
router.post('/', upload.single('image'), consommationController.createConsommation);

// Routes existantes
router.get('/', consommationController.getAllConsommations);
router.get('/:id', consommationController.getConsommationById);
router.put('/:id', consommationController.updateConsommation);
router.delete('/:id', consommationController.deleteConsommation);

module.exports = router;