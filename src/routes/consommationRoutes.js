const express = require('express');
const router = express.Router();
const consommationController = require('../controllers/consommationController');

router.post('/', consommationController.createConsommation);
router.get('/', consommationController.getAllConsommations);
router.put('/:id', consommationController.updateConsommation);
router.delete('/:id', consommationController.deleteConsommation);

module.exports = router;