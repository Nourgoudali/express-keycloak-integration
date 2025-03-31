const Achat = require('../models/achatModel');
const Article = require('../models/articleModel');
const Facture = require('../models/factureModel');
const Fournisseur = require('../models/fournisseurModel');
const fs = require('fs');

exports.createAchat = async (req, res) => {
  try {
    let id_fournisseur, articlesA, annee;
    const image = req.file;

    if (req.body.articlesA && typeof req.body.articlesA === 'string') {
      try {
        articlesA = JSON.parse(req.body.articlesA);
      } catch (error) {
        return res.status(400).json({ error: 'Format des articles invalide' });
      }
      id_fournisseur = req.body.id_fournisseur;
      annee = req.body.annee;
    } else {
      ({ id_fournisseur, articlesA, annee } = req.body);
    }

    if (!id_fournisseur) return res.status(400).json({ error: 'id_fournisseur est requis' });
    if (!articlesA || !Array.isArray(articlesA) || articlesA.length === 0) {
      return res.status(400).json({ error: 'articlesA doit être un tableau non vide d\'articles' });
    }
    if (!annee) return res.status(400).json({ error: 'annee est requis' });

    const articlesVerifies = await Promise.all(
      articlesA.map(async (article) => {
        const { produit, quantite, prix, date_expiration } = article;
        if (!produit || !quantite || !prix || !date_expiration) {
          throw new Error('Chaque article doit avoir produit, quantite, prix et date_expiration');
        }

        const articleInfo = await Article.findById(produit);
        if (!articleInfo) throw new Error(`Article non trouvé : ${produit}`);

        return {
          produit,
          quantite: parseInt(quantite),
          prix: parseFloat(prix),
          date_expiration: new Date(date_expiration),
          stock_reel: parseInt(quantite),
        };
      })
    );

    const achat = new Achat({
      id_fournisseur,
      articlesA: articlesVerifies,
      annee,
    });

    const savedAchat = await achat.save();

    // Mise à jour des quantités d'articles
    for (const article of articlesVerifies) {
      const updatedArticle = await Article.findById(article.produit);
      const newQuantite = updatedArticle.quantite + article.quantite;
      
      // Déterminer le statut en fonction de la nouvelle quantité et du minStock
      const newStatut = newQuantite <= updatedArticle.minStock ? 'Faible stock' : 'En stock';
      
      await Article.findByIdAndUpdate(
        article.produit,
        { 
          quantite: newQuantite,
          statut: newStatut
        },
        { new: true }
      );
    }

    // Génération de N_facture
    const N_facture = await Facture.generateFactureNumber('achat');

    const montantTotal = articlesVerifies.reduce(
      (total, article) => total + article.prix * article.quantite,
      0
    );

    const factureData = {
      N_facture,
      type: 'achat',
      id_fournisseur,
      articlesA: [savedAchat._id],
      montant_total: montantTotal,
      annee,
    };

    if (image) {
      const imagePath = `uploads/factures/${Date.now()}-${image.originalname}`;
      fs.writeFileSync(imagePath, image.buffer);
      factureData.image_path = imagePath;
    }

    const facture = new Facture(factureData);
    await facture.save();

    // Peuplement des données pour une meilleure lisibilité
    const populatedAchat = await Achat.findById(savedAchat._id)
      .populate('id_fournisseur')
      .populate({
        path: 'articlesA',
        populate: {
          path: 'produit'
        }
      });

    const populatedFacture = await Facture.findById(facture._id)
      .populate('id_fournisseur')
      .populate({
        path: 'articlesA',
        populate: {
          path: 'articlesA',
          populate: {
            path: 'produit'
          }
        }
      });

    res.status(201).json({
      message: 'Achat et facture créés avec succès',
      achat: populatedAchat,
      facture: populatedFacture,
    });

  } catch (error) {
    console.error("Erreur lors de la création de l'achat:", error);
    res.status(500).json({ error: error.message || 'Erreur lors du traitement de la demande' });
  }
};


exports.getAllAchats = async (req, res) => {
  try {
    const achats = await Achat.find()
      .populate('id_fournisseur')
      .populate({
        path: 'articlesA',
        populate: {
          path: 'produit'
        }
      });

    res.json(achats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAchatById = async (req, res) => {
  try {
    const achat = await Achat.findById(req.params.id)
      .populate('id_fournisseur')
      .populate({
        path: 'articlesA',
        populate: {
          path: 'produit'
        }
      });

    if (!achat) return res.status(404).json({ error: 'Achat not found' });

    res.json(achat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updateAchat = (req, res) => {
  const { quantite } = req.body; // Vérifier uniquement si la quantité change
  Achat.findById(req.params.id)
    .then(achat => {
      if (!achat) return res.status(404).json({ error: 'Achat not found' });
      return Article.findById(achat.id_article)
        .then(article => {
          if (!article) return res.status(404).json({ error: 'Article not found' });

          const autresAchats = Achat.find({ id_article: achat.id_article, _id: { $ne: req.params.id } });
          return autresAchats.then(achats => {
            const stockActuel = achats.reduce((total, a) => total + a.stock_reel, 0) + achat.stock_reel;
            const nouveauStock = stockActuel - achat.stock_reel + (quantite || achat.quantite);

            if (nouveauStock > article.maxStock) {
              return res.status(400).json({ error: `Quantité dépasse maxStock (${article.maxStock})` });
            }

            return Achat.findByIdAndUpdate(req.params.id, req.body, { new: true })
              .populate('id_fournisseur')
              .populate({
                path: 'articlesA',
                populate: {
                  path: 'produit'
                }
              });
          });
        });
    })
    .then(achat => {
      if (!achat) return res.status(404).json({ error: 'Achat not found' });
      res.json(achat);
    })
    .catch(error => res.status(400).json({ error: error.message }));
};

exports.deleteAchat = (req, res) => {
  Achat.findByIdAndDelete(req.params.id)
    .then(achat => {
      if (!achat) return res.status(404).json({ error: 'Achat not found' });
      res.json({ message: 'Achat deleted' });
    })
    .catch(error => res.status(500).json({ error: error.message }));
};