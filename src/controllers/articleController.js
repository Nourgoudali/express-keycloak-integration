const Article = require('../models/articleModel');
const XLSX = require('xlsx');

// Ajout manuel d'un article 
exports.createArticle = (req, res) => {
  const article = new Article(req.body);
  article.save()
    .then(savedArticle => res.status(201).json(savedArticle))
    .catch(error => res.status(400).json({ error: error.message }));
};

// Importation depuis Excel 
exports.importArticlesFromExcel = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Aucun fichier Excel téléversé' });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData.length || !jsonData[0].hasOwnProperty('nom') || !jsonData[0].hasOwnProperty('categorie') || !jsonData[0].hasOwnProperty('unite')) {
      return res.status(400).json({ error: 'Le fichier Excel doit contenir les colonnes "nom", "categorie" et "unite"' });
    }

    const articlesToSave = jsonData.map(row => ({
      nom: row.nom,
      categorie: row.categorie,
      unite: row.unite,
      minStock: row.minStock || 0,
      maxStock: row.maxStock || 100,
    }));

    Article.insertMany(articlesToSave)
      .then(savedArticles => {
        res.status(201).json({ message: 'Articles importés avec succès', data: savedArticles });
      })
      .catch(error => {
        res.status(400).json({ error: error.message });
      });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'importation : ' + error.message });
  }
};

// Récupérer tous les articles 
exports.getAllArticles = (req, res) => {
  Article.find()
    .then(articles => res.json(articles))
    .catch(error => res.status(500).json({ error: error.message }));
};

// Récupérer un article par ID 
exports.getArticleById = (req, res) => {
  Article.findById(req.params.id)
    .then(article => {
      if (!article) return res.status(404).json({ error: 'Article not found' });
      res.json(article);
    })
    .catch(error => res.status(500).json({ error: error.message }));
};

// Mettre à jour un article 
exports.updateArticle = (req, res) => {
  Article.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then(article => {
      if (!article) return res.status(404).json({ error: 'Article not found' });
      res.json(article);
    })
    .catch(error => res.status(400).json({ error: error.message }));
};

exports.deleteArticle = (req, res) => {
  Article.findByIdAndDelete(req.params.id)
    .then(article => {
      if (!article) return res.status(404).json({ error: 'Article not found' });
      res.json({ message: 'Article deleted' });
    })
    .catch(error => res.status(500).json({ error: error.message }));
};