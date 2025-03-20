const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const multer = require('multer');


const upload = multer({ storage: multer.memoryStorage() }); 

router.post('/import', upload.single('file'), articleController.importArticlesFromExcel);

router.post('/', articleController.createArticle);
router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticleById);
router.put('/:id', articleController.updateArticle);
router.delete('/:id', articleController.deleteArticle);

module.exports = router;