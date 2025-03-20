const express = require('express');
const router = express.Router();
const factureController = require('../controllers/factureController');
const multer = require('multer');


const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), factureController.createFacture); 
router.get('/', factureController.getAllFactures);
router.get('/:id', factureController.getFactureById);
router.delete('/:id', factureController.deleteFacture);

module.exports = router;