const Consommation = require('../models/consommationModel');
const Achat = require('../models/achatModel');
const Article = require('../models/articleModel');

exports.createConsommation = (req, res) => {
  const { id_article, quantite, type } = req.body;

  Achat.find({ id_article })
    .sort('date_expiration') 
    .then(achats => {
      return Article.findById(id_article)
        .then(article => {
          if (!article) return res.status(404).json({ error: 'Article not found' });

          let quantiteRestante = quantite;
          let consommations = [];

          const processAchat = (index) => {
            if (index >= achats.length || quantiteRestante <= 0) {
              
              const stockRestant = achats.reduce((total, achat) => total + achat.stock_reel, 0);
              if (stockRestant < article.minStock) {
                return res.status(400).json({ error: `Consommation dépasse minStock (${article.minStock})` });
              }
              if (quantiteRestante > 0) {
                return res.status(400).json({ error: 'Stock insuffisant pour cette consommation' });
              }
              return res.status(201).json(consommations);
            }

            const achat = achats[index];
            const quantiteAConsommer = Math.min(quantiteRestante, achat.stock_reel);

            if (quantiteAConsommer > 0) {
              const consommation = new Consommation({
                id_article,
                quantite: quantiteAConsommer,
                type,
              });

              consommation.save()
                .then(savedConsommation => {
                  consommations.push(savedConsommation);

                  achat.stock_reel -= quantiteAConsommer;
                  achat.save()
                    .then(() => processAchat(index + 1))
                    .catch(error => res.status(500).json({ error: error.message }));
                })
                .catch(error => {
                  if (error.name === 'ValidationError') {
                    return res.status(400).json({ error: 'Type de consommation invalide' });
                  }
                  res.status(400).json({ error: error.message });
                });
            } else {
              processAchat(index + 1);
            }
          };

          processAchat(0);
        });
    })
    .catch(error => res.status(500).json({ error: error.message }));
};

exports.getAllConsommations = (req, res) => {
  Consommation.find()
    .populate('id_article')
    .then(consommations => res.json(consommations))
    .catch(error => res.status(500).json({ error: error.message }));
};

exports.updateConsommation = (req, res) => {
  Consommation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .then(consommation => {
      if (!consommation) return res.status(404).json({ error: 'Consommation not found' });
      res.json(consommation);
    })
    .catch(error => {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: 'Type de consommation invalide' });
      }
      res.status(400).json({ error: error.message });
    });
};

exports.deleteConsommation = (req, res) => {
  Consommation.findByIdAndDelete(req.params.id)
    .then(consommation => {
      if (!consommation) return res.status(404).json({ error: 'Consommation not found' });
      res.json({ message: 'Consommation deleted' });
    })
    .catch(error => res.status(500).json({ error: error.message }));
};