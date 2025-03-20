const express = require('express');
const router = express.Router();
const achatController = require('../controllers/achatController');

router.post('/', achatController.createAchat);
router.get('/', achatController.getAllAchats);
router.put('/:id', achatController.updateAchat);
router.delete('/:id', achatController.deleteAchat);

module.exports = router;