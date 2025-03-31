const Article = require('../models/articleModel');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Ajout manuel d'un article 
exports.createArticle = (req, res) => {
  const articleData = req.body;
  
  // Vérifier si le statut est défini, sinon définir en fonction de la quantité
  if (!articleData.statut) {
    if (articleData.quantite && articleData.minStock) {
      articleData.statut = articleData.quantite <= articleData.minStock ? 'Faible stock' : 'En stock';
    } else {
      articleData.statut = 'En stock'; // Valeur par défaut
    }
  }
  
  const article = new Article(articleData);
  article.save()
    .then(savedArticle => res.status(201).json(savedArticle))
    .catch(error => res.status(400).json({ error: error.message }));
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
  const updateData = req.body;
  
  // Mettre à jour le statut en fonction de la quantité si celle-ci est modifiée
  if (updateData.quantite !== undefined && updateData.minStock !== undefined) {
    updateData.statut = updateData.quantite <= updateData.minStock ? 'Faible stock' : 'En stock';
  } else if (updateData.quantite !== undefined) {
    // Récupérer d'abord l'article pour connaître son minStock
    Article.findById(req.params.id)
      .then(article => {
        if (!article) return res.status(404).json({ error: 'Article not found' });
        
        updateData.statut = updateData.quantite <= article.minStock ? 'Faible stock' : 'En stock';
        
        return Article.findByIdAndUpdate(req.params.id, updateData, { new: true });
      })
      .then(updatedArticle => {
        res.json(updatedArticle);
      })
      .catch(error => res.status(400).json({ error: error.message }));
    return;
  }
  
  // Si la quantité n'est pas modifiée, mettre à jour normalement
  Article.findByIdAndUpdate(req.params.id, updateData, { new: true })
    .then(article => {
      if (!article) return res.status(404).json({ error: 'Article not found' });
      res.json(article);
    })
    .catch(error => res.status(400).json({ error: error.message }));
};

// Supprimer un article
exports.deleteArticle = (req, res) => {
  Article.findByIdAndDelete(req.params.id)
    .then(article => {
      if (!article) return res.status(404).json({ error: 'Article not found' });
      res.json({ message: 'Article deleted' });
    })
    .catch(error => res.status(500).json({ error: error.message }));
};