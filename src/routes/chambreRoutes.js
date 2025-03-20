const express = require('express');
const router = express.Router();
const chambreController = require('../controllers/chambreController');


router.post('/', chambreController.createChambre);       
router.get('/', chambreController.getAllChambres);       
router.get('/:id', chambreController.getChambreById);    
router.put('/:id', chambreController.updateChambre);     
router.delete('/:id', chambreController.deleteChambre);  


router.post('/:id/occupants', chambreController.addOccupant);   
router.delete('/:id/occupants', chambreController.removeOccupant);

module.exports = router;