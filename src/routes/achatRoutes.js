const express = require('express');
const router = express.Router();
const achatController = require('../controllers/achatController');
const multer = require('multer');

// Configuration de multer pour l'upload d'images
const upload = multer({ storage: multer.memoryStorage() });

// Route pour créer un achat avec possibilité d'uploader une image
router.post('/', upload.single('image'), achatController.createAchat);
router.get('/', achatController.getAllAchats);
router.get('/:id', achatController.getAchatById);
router.put('/:id', achatController.updateAchat);
router.delete('/:id', achatController.deleteAchat);

module.exports = router;