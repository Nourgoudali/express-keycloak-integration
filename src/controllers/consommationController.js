const Consommation = require('../models/consommationModel');
const Achat = require('../models/achatModel');
const Article = require('../models/articleModel');
const Facture = require('../models/factureModel');
const fs = require('fs');

exports.createConsommation = (req, res) => {
  const { articlesC, annee } = req.body;
  const image = req.file;
  
  if (!articlesC || !Array.isArray(articlesC) || articlesC.length === 0) {
    return res.status(400).json({ error: 'articlesC doit être un tableau non vide' });
  }

  if (!annee) {
    return res.status(400).json({ error: 'annee est requis' });
  }

  // Vérifier chaque article dans articlesC
  const verifierArticles = async () => {
    try {
      const articlesAvecStock = [];
      
      // Vérifier tous les produits existants et leur stock
      for (const article of articlesC) {
        const { produit, quantite, type } = article;
        
        if (!produit || !quantite || !type) {
          return { error: 'Chaque article doit avoir produit, quantite et type' };
        }
        
        // Vérifier si l'article existe
        const articleInfo = await Article.findById(produit);
        if (!articleInfo) {
          return { error: `Article avec ID ${produit} introuvable` };
        }
        
        // Vérifier le stock disponible pour cet article
        const achats = await Achat.find({ 'articlesA.produit': produit }).sort('articlesA.date_expiration');
        
        // Calculer le stock disponible
        let stockDisponible = 0;
        achats.forEach(achat => {
          achat.articlesA.forEach(art => {
            if (art.produit.toString() === produit) {
              stockDisponible += art.stock_reel || 0;
            }
          });
        });
        
        console.log(`Article: ${articleInfo.produit}, Stock disponible: ${stockDisponible}, Quantité demandée: ${quantite}`);
        
        // Vérifier si le stock est suffisant pour la quantité demandée
        if (stockDisponible < parseInt(quantite)) {
          return { error: `Stock insuffisant pour l'article ${articleInfo.produit}. Stock disponible: ${stockDisponible}, Quantité demandée: ${quantite}` };
        }
        
        // Seulement avertir si le stock passe en dessous du seuil minimal après consommation
        if ((stockDisponible - parseInt(quantite)) < articleInfo.minStock) {
          console.warn(`Attention: La consommation va faire passer le stock en dessous du seuil minimal (${articleInfo.minStock}) pour l'article ${articleInfo.produit}`);
        }
        
        articlesAvecStock.push({
          produit,
          quantite: parseInt(quantite),
          type,
          stockDisponible,
          achats
        });
      }
      
      // Tous les articles sont valides et ont assez de stock
      return { success: true, articlesAvecStock };
    } catch (error) {
      console.error("Erreur dans verifierArticles:", error);
      return { error: error.message || "Erreur lors de la vérification des articles" };
    }
  };

  // Fonction pour mettre à jour le stock après consommation
  const mettreAJourStock = async (articlesAvecStock, consommation) => {
    try {
      if (!Array.isArray(articlesAvecStock)) {
        console.error("mettreAJourStock: articlesAvecStock n'est pas un tableau", articlesAvecStock);
        return;
      }
      
      for (const article of articlesAvecStock) {
        const { produit, quantite, achats } = article;
        let quantiteRestante = quantite;
        
        // Mettre à jour le stock de chaque achat
        for (let i = 0; i < achats.length && quantiteRestante > 0; i++) {
          const achat = achats[i];
          
          for (let j = 0; j < achat.articlesA.length && quantiteRestante > 0; j++) {
            const articleAchat = achat.articlesA[j];
            
            if (articleAchat.produit.toString() === produit) {
              const quantiteAConsommer = Math.min(quantiteRestante, articleAchat.stock_reel || 0);
              
              if (quantiteAConsommer > 0) {
                articleAchat.stock_reel -= quantiteAConsommer;
                quantiteRestante -= quantiteAConsommer;
                await achat.save();
              }
            }
          }
        }
        
        // Mise à jour du statut de l'article après consommation
        const articleInfo = await Article.findById(produit);
        const achatsActuels = await Achat.find({ 'articlesA.produit': produit });
        
        let stockTotal = 0;
        achatsActuels.forEach(achat => {
          achat.articlesA.forEach(art => {
            if (art.produit.toString() === produit.toString()) {
              stockTotal += art.stock_reel || 0;
            }
          });
        });
        
        const nouveauStatut = stockTotal <= articleInfo.minStock ? 'Faible stock' : 'En stock';
        await Article.findByIdAndUpdate(produit, {
          quantite: stockTotal,
          statut: nouveauStatut
        });
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du stock:", error);
      // Même si la mise à jour du stock échoue, la consommation a été créée
    }
  };

  verifierArticles()
    .then(result => {
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }
      
      const { articlesAvecStock } = result;
      
      // Créer la consommation
      const consommation = new Consommation({
        articlesC: articlesC.map(article => ({
          produit: article.produit,
          quantite: parseInt(article.quantite),
          type: article.type
        })),
        date_consommation: new Date(),
        annee
      });
      
      return consommation.save()
        .then(async (savedConsommation) => {
          try {
            // Mettre à jour le stock pour chaque article
            await mettreAJourStock(articlesAvecStock, savedConsommation);
            
            // Génération de N_facture
            const N_facture = await Facture.generateFactureNumber('consommation');
            
            // Créer une facture associée à cette consommation
            const montantTotal = articlesAvecStock.reduce((total, article) => {
              // On peut déterminer le prix unitaire à partir des achats ou utiliser une valeur par défaut
              const prixUnitaire = 1; // À remplacer par un calcul plus précis si nécessaire
              return total + (prixUnitaire * article.quantite);
            }, 0);
            
            const factureData = {
              N_facture,
              type: 'consommation',
              articlesC: savedConsommation._id,
              montant_total: montantTotal,
              annee
            };
            
            // Ajouter l'image à la facture si présente
            if (image) {
              const imagePath = `uploads/factures/${Date.now()}-${image.originalname}`;
              fs.writeFileSync(imagePath, image.buffer);
              factureData.image_path = [imagePath]; // Utiliser un tableau pour image_path
            }
            
            const facture = new Facture(factureData);
            const savedFacture = await facture.save();
            
            // Retourner avec les données populées
            const populatedConsommation = await Consommation.findById(savedConsommation._id)
              .populate({
                path: 'articlesC',
                populate: {
                  path: 'produit'
                }
              });
              
            const populatedFacture = await Facture.findById(savedFacture._id)
              .populate('id_fournisseur')
              .populate({
                path: 'articlesC',
                populate: {
                  path: 'articlesC',
                  populate: {
                    path: 'produit'
                  }
                }
              });
            
            return res.status(201).json({
              consommation: populatedConsommation,
              facture: populatedFacture
            });
          } catch (err) {
            console.error("Erreur après sauvegarde de la consommation:", err);
            // La consommation a été sauvegardée, mais il y a eu un problème avec la mise à jour du stock ou la création de facture
            return res.status(500).json({ 
              error: err.message,
              partial_success: true,
              consommation: savedConsommation
            });
          }
        })
        .catch(err => {
          console.error("Erreur lors de la sauvegarde de la consommation:", err);
          return res.status(500).json({ error: err.message });
        });
    })
    .catch(error => {
      console.error("Erreur générale lors de la création de la consommation:", error);
      return res.status(500).json({ error: error.message || 'Erreur lors du traitement de la demande' });
    });
};

exports.getAllConsommations = (req, res) => {
  Consommation.find()
    .populate({
      path: 'articlesC',
      populate: {
        path: 'produit'
      }
    })
    .then(consommations => res.json(consommations))
    .catch(error => res.status(500).json({ error: error.message }));
};

exports.getConsommationById = (req, res) => {
  Consommation.findById(req.params.id)
    .populate({
      path: 'articlesC',
      populate: {
        path: 'produit'
      }
    })
    .then(consommation => {
      if (!consommation) return res.status(404).json({ error: 'Consommation not found' });
      res.json(consommation);
    })
    .catch(error => res.status(500).json({ error: error.message }));
};

exports.updateConsommation = (req, res) => {
  // On ne permet pas de modifier les articles consommés une fois créés
  // pour ne pas perturber le stock
  const { date_consommation, annee } = req.body;
  const updateData = {};
  
  if (date_consommation) updateData.date_consommation = date_consommation;
  if (annee) updateData.annee = annee;
  
  Consommation.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true })
    .populate({
      path: 'articlesC',
      populate: {
        path: 'produit'
      }
    })
    .then(consommation => {
      if (!consommation) return res.status(404).json({ error: 'Consommation not found' });
      res.json(consommation);
    })
    .catch(error => {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: 'Données de consommation invalides' });
      }
      res.status(400).json({ error: error.message });
    });
};

exports.deleteConsommation = (req, res) => {
  // La suppression devrait idéalement remettre le stock, 
  // mais cela pourrait être complexe si d'autres opérations ont eu lieu entre-temps
  // Nous permettons simplement la suppression pour le moment
  Consommation.findByIdAndDelete(req.params.id)
    .then(consommation => {
      if (!consommation) return res.status(404).json({ error: 'Consommation not found' });
      res.json({ message: 'Consommation deleted' });
    })
    .catch(error => res.status(500).json({ error: error.message }));
};