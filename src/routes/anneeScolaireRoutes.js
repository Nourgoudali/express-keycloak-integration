const express = require('express');
const router = express.Router();
const anneeScolaireController = require('../controllers/anneeScolaireController');

// Récupérer l'année scolaire active
router.get('/active', anneeScolaireController.getActiveYear);

// Récupérer toutes les années scolaires
router.get('/all', anneeScolaireController.getAllYears);

// Route pour forcer la mise à jour de l'année scolaire active (peut être appelée par un cron job)
router.get('/update', anneeScolaireController.updateActiveYear);

module.exports = router;
