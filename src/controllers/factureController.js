const Facture = require('../models/factureModel');
const Achat = require('../models/achatModel');
const Consommation = require('../models/consommationModel');
const Article = require('../models/articleModel');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Créer une facture (pour achats ou consommations)
exports.createFacture = (req, res) => {
  const { type, id_fournisseur, id_article, achats, consommations } = req.body;
  const image = req.file;

  if (!type || !['achat', 'consommation'].includes(type)) {
    return res.status(400).json({ error: 'Type doit être "achat" ou "consommation"' });
  }
  if (type === 'achat' && !id_fournisseur) {
    return res.status(400).json({ error: 'id_fournisseur est requis pour une facture de type achat' });
  }
  if (type === 'consommation' && !id_article) {
    return res.status(400).json({ error: 'id_article est requis pour une facture de type consommation' });
  }
  if (type === 'achat' && !achats) {
    return res.status(400).json({ error: 'achats est requis pour une facture de type achat' });
  }
  if (type === 'consommation' && !consommations) {
    return res.status(400).json({ error: 'consommations est requis pour une facture de type consommation' });
  }

  // Vérification des limites stock avant création
  let stockCheckPromise;
  if (type === 'achat') {
    stockCheckPromise = Achat.find({ _id: { $in: achats } })
      .then(achatsData => {
        return Article.findById(achatsData[0].id_article) // Prend le premier article comme référence
          .then(article => {
            const stockActuel = Achat.find({ id_article: article._id })
              .then(allAchats => allAchats.reduce((total, a) => total + a.stock_reel, 0));
            return stockActuel.then(stock => {
              const nouveauStock = stock + achatsData.reduce((sum, a) => sum + a.quantite, 0);
              if (nouveauStock > article.maxStock) {
                throw new Error(`Quantité dépasse maxStock (${article.maxStock})`);
              }
            });
          });
      });
  } else {
    stockCheckPromise = Consommation.find({ _id: { $in: consommations } })
      .then(consommationsData => {
        return Article.findById(consommationsData[0].id_article)
          .then(article => {
            const stockActuel = Achat.find({ id_article: article._id })
              .then(allAchats => allAchats.reduce((total, a) => total + a.stock_reel, 0));
            return stockActuel.then(stock => {
              const quantiteConsommee = consommationsData.reduce((sum, c) => sum + c.quantite, 0);
              if (stock - quantiteConsommee < article.minStock) {
                throw new Error(`Consommation dépasse minStock (${article.minStock})`);
              }
            });
          });
      });
  }

  stockCheckPromise
    .then(() => {
      // Calculer le montant total
      let montantTotalPromise;
      if (type === 'achat') {
        montantTotalPromise = Achat.find({ _id: { $in: achats } })
          .then(achatsData => {
            return achatsData.reduce((total, achat) => total + (achat.prix * achat.quantite), 0);
          });
      } else {
        montantTotalPromise = Consommation.find({ _id: { $in: consommations } })
          .populate('id_article')
          .then(consommationsData => {
            return consommationsData.reduce((total, con) => {
              const prixUnitaire = 1; // À remplacer par un prix réel
              return total + (prixUnitaire * con.quantite);
            }, 0);
          });
      }

      return montantTotalPromise;
    })
    .then(montant_total => {
      const factureData = {
        type,
        id_fournisseur: type === 'achat' ? id_fournisseur : undefined,
        id_article: type === 'consommation' ? id_article : undefined,
        achats: type === 'achat' ? achats : [],
        consommations: type === 'consommation' ? consommations : [],
        montant_total,
      };

      if (image) {
        const imagePath = `uploads/factures/${Date.now()}-${image.originalname}`;
        fs.writeFileSync(imagePath, image.buffer);
        factureData.image_path = imagePath;
      }

      const facture = new Facture(factureData);
      return facture.save();
    })
    .then(savedFacture => {
      res.status(201).json(savedFacture);
      generatePDF(savedFacture, res);
    })
    .catch(error => res.status(400).json({ error: error.message }));
};

// Récupérer toutes les factures
exports.getAllFactures = (req, res) => {
  Facture.find()
    .populate('id_fournisseur id_article achats consommations')
    .then(factures => res.json(factures))
    .catch(error => res.status(500).json({ error: error.message }));
};

// Récupérer une facture par ID
exports.getFactureById = (req, res) => {
  Facture.findById(req.params.id)
    .populate('id_fournisseur id_article achats consommations')
    .then(facture => {
      if (!facture) return res.status(404).json({ error: 'Facture not found' });
      res.json(facture);
    })
    .catch(error => res.status(500).json({ error: error.message }));
};

// Supprimer une facture
exports.deleteFacture = (req, res) => {
  Facture.findByIdAndDelete(req.params.id)
    .then(facture => {
      if (!facture) return res.status(404).json({ error: 'Facture not found' });
      if (facture.image_path && fs.existsSync(facture.image_path)) {
        fs.unlinkSync(facture.image_path);
      }
      res.json({ message: 'Facture deleted' });
    })
    .catch(error => res.status(500).json({ error: error.message }));
};

// Générer un PDF pour une facture (inchangé)
function generatePDF(facture, res) {
  const doc = new PDFDocument();
  const filename = `facture_${facture._id}.pdf`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/pdf');

  doc.pipe(res);

  doc.fontSize(20).text('Facture', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`ID Facture: ${facture._id}`);
  doc.text(`Date: ${facture.date}`);
  doc.text(`Type: ${facture.type}`);
  if (facture.type === 'achat' && facture.id_fournisseur) {
    doc.text(`Fournisseur: ${facture.id_fournisseur.nom || 'Non spécifié'}`);
  }
  if (facture.type === 'consommation' && facture.id_article) {
    doc.text(`Article: ${facture.id_article.nom || 'Non spécifié'}`);
  }
  doc.text(`Montant Total: ${facture.montant_total} DH`);

  if (facture.type === 'achat') {
    doc.text('Détails des achats:', { underline: true });
    facture.achats.forEach((achId, index) => {
      Achat.findById(achId)
        .then(ach => {
          doc.text(`- Achat ${index + 1}: ${ach.quantite} unités à ${ach.prix} DH`);
          if (index === facture.achats.length - 1) doc.end();
        })
        .catch(err => {
          console.error(err);
          if (index === facture.achats.length - 1) doc.end();
        });
    });
  } else {
    doc.text('Détails des consommations:', { underline: true });
    facture.consommations.forEach((conId, index) => {
      Consommation.findById(conId)
        .then(con => {
          doc.text(`- Consommation ${index + 1}: ${con.quantite} unités`);
          if (index === facture.consommations.length - 1) doc.end();
        })
        .catch(err => {
          console.error(err);
          if (index === facture.consommations.length - 1) doc.end();
        });
    });
  }

  if (facture.image_path) {
    doc.moveDown();
    doc.text(`Image associée: ${facture.image_path}`);
  }
}