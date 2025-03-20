const Achat = require('../models/achatModel');
const Article = require('../models/articleModel');

exports.createAchat = (req, res) => {
  const { id_fournisseur, id_article, quantite, prix, date_expiration } = req.body;

  Achat.find({ id_article }) 
      .then(achats => {
      return Article.findById(id_article)
        .then(article => {
          if (!article) return res.status(404).json({ error: 'Article not found' });

          
          const stockActuel = achats.reduce((total, achat) => total + achat.stock_reel, 0);
          const nouveauStock = stockActuel + quantite;

          if (nouveauStock > article.maxStock) {
            return res.status(400).json({ error: `Quantité dépasse maxStock (${article.maxStock})` });
          }

          const achat = new Achat({
            id_fournisseur,
            id_article,
            quantite,
            prix,
            date_expiration,
            stock_reel: quantite, 
          });

          return achat.save();
        });
    })
    .then(savedAchat => res.status(201).json(savedAchat))
    .catch(error => res.status(400).json({ error: error.message }));
};

exports.getAllAchats = (req, res) => {
  Achat.find()
    .populate('id_article id_fournisseur')
    .then(achats => res.json(achats))
    .catch(error => res.status(500).json({ error: error.message }));
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

            return Achat.findByIdAndUpdate(req.params.id, req.body, { new: true });
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