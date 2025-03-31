const Facture = require('../models/factureModel');
const Achat = require('../models/achatModel');
const Consommation = require('../models/consommationModel');
const Article = require('../models/articleModel');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Récupérer toutes les factures
exports.getAllFactures = (req, res) => {
  const { annee } = req.query;
  
  // Construire la requête de filtrage
  const query = {};
  if (annee) {
    query.annee = annee;
  }
  
  Facture.find(query)
    .populate('id_fournisseur')
    .populate({
      path: 'articlesA',
      populate: [
        { path: 'id_fournisseur' },
        { 
          path: 'articlesA',
          populate: {
            path: 'produit'
          }
        }
      ]
    })
    .populate({
      path: 'articlesC',
      populate: {
        path: 'articlesC',
        populate: {
          path: 'produit'
        }
      }
    })
    .then(factures => res.json(factures))
    .catch(error => res.status(500).json({ error: error.message }));
};

// Récupérer une facture par ID
exports.getFactureById = (req, res) => {
  Facture.findById(req.params.id)
    .populate('id_fournisseur')
    .populate({
      path: 'articlesA',
      populate: [
        { path: 'id_fournisseur' },
        { 
          path: 'articlesA',
          populate: {
            path: 'produit'
          }
        }
      ]
    })
    .populate({
      path: 'articlesC',
      populate: {
        path: 'articlesC',
        populate: {
          path: 'produit'
        }
      }
    })
    .then(facture => {
      if (!facture) return res.status(404).json({ error: 'Facture not found' });
      res.json(facture);
    })
    .catch(error => res.status(500).json({ error: error.message }));
};

// Supprimer une facture

// Générer un PDF pour une facture
exports.generateFacturePDF = (req, res) => {
  Facture.findById(req.params.id)
    .populate('id_fournisseur')
    .populate({
      path: 'articlesA',
      populate: [
        { path: 'id_fournisseur' },
        { 
          path: 'articlesA',
          populate: {
            path: 'produit'
          }
        }
      ]
    })
    .populate({
      path: 'articlesC',
      populate: {
        path: 'articlesC',
        populate: {
          path: 'produit'
        }
      }
    })
    .then(facture => {
      if (!facture) return res.status(404).json({ error: 'Facture not found' });
      
      const doc = new PDFDocument({
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });
      const filename = `facture_${facture.N_facture}.pdf`;
      
      // Configuration des en-têtes pour le téléchargement
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/pdf');
      
      doc.pipe(res);
      
      doc.font('Helvetica-Bold').fontSize(20).text(`Facture ${facture.N_facture}`, { align: 'center' });
      doc.moveDown(1);      // Style plus moderne
      doc.font('Helvetica-Bold').fontSize(14).text(`N° de facture: ${facture.N_facture}`, { continued: false });
      doc.moveDown(0.5);
      
      doc.font('Helvetica-Bold').fontSize(14).text('Type: ', { continued: true })
         .font('Helvetica').text(facture.type.charAt(0).toUpperCase() + facture.type.slice(1));
      doc.moveDown(0.5);
      
      doc.font('Helvetica-Bold').fontSize(14).text('Date: ', { continued: true })
         .font('Helvetica').text(new Date(facture.date).toLocaleDateString());
      doc.moveDown(0.5);
      
      // Afficher le fournisseur directement depuis la facture si disponible
      if (facture.type === 'achat' && facture.id_fournisseur) {
        doc.font('Helvetica-Bold').fontSize(14).text('Fournisseur: ', { continued: true })
           .font('Helvetica').text(facture.id_fournisseur.nom || 'Non spécifié');
        doc.moveDown(0.5);
      } else if (facture.type === 'achat' && facture.articlesA && facture.articlesA.length > 0) {
        const achat = facture.articlesA[0];
        if (achat && achat.id_fournisseur) {
          doc.font('Helvetica-Bold').fontSize(14).text('Fournisseur: ', { continued: true })
             .font('Helvetica').text(achat.id_fournisseur.nom || 'Non spécifié');
          doc.moveDown(0.5);
        }
      }
      
      doc.font('Helvetica-Bold').fontSize(14).text('Montant total: ', { continued: true })
         .font('Helvetica').text(`${facture.montant_total} DH`);
      doc.moveDown(2);
      
      // Titre de la section articles
      doc.font('Helvetica-Bold').fontSize(16).text('Articles', { underline: true });
      doc.moveDown();
      
      // Tableau des articles
      const tableTop = doc.y;
      const tableHeaders = ['Article', 'Quantité', 'Prix unitaire', 'Total', "Date d'expiration"];
      const tableColumnWidths = [110, 80, 90, 90, 150];
      
      // Dessiner l'en-tête du tableau
      doc.font('Helvetica-Bold').fontSize(12);
      let currentXPosition = 50; // Position de départ (marge gauche)
      
      // Fond gris clair pour l'en-têtem
      doc.rect(50, tableTop, doc.page.width - 100, 25)
         .fill('#f2f2f2');
      
      // Texte des en-têtes
      tableHeaders.forEach((header, i) => {
        doc.fillColor('#000')
           .text(header, currentXPosition, tableTop + 7, { width: tableColumnWidths[i], align:'center' });
        currentXPosition += tableColumnWidths[i];
      });
      
      // Contenu du tableau
      doc.font('Helvetica').fontSize(12);
      let tableRowY = tableTop + 30;
      
      // Afficher les articles selon le type de facture
      if (facture.type === 'achat' && facture.articlesA && facture.articlesA.length > 0) {
        const achat = facture.articlesA[0];
        
        if (achat && achat.articlesA && achat.articlesA.length > 0) {
          achat.articlesA.forEach((article, index) => {
            const articleInfo = article.produit;
            const nomArticle = articleInfo && articleInfo.produit ? articleInfo.produit : 'Article inconnu';
            const quantite = article.quantite;
            const unite = articleInfo && articleInfo.unite ? articleInfo.unite : '';
            const quantiteAvecUnite = unite ? `${quantite} ${unite}` : quantite;
            const prixUnitaire = `${article.prix} DH`;
            const prixTotal = `${(article.quantite * article.prix).toFixed(2)} DH`;
            const dateExpiration = article.date_expiration 
              ? new Date(article.date_expiration).toLocaleDateString() 
              : 'Non spécifiée';
            
            // Alterner couleur de fond pour les lignes
            if (index % 2 === 0) {
              doc.rect(50, tableRowY - 5, doc.page.width - 100, 25)
                 .fill('#f9f9f9');
            }
            
            // Ajouter le contenu de la ligne
            currentXPosition = 50;
            doc.fillColor('#000')
               .text(nomArticle, currentXPosition, tableRowY, { width: tableColumnWidths[0], align:'center' });
            currentXPosition += tableColumnWidths[0];
            
            doc.text(quantiteAvecUnite, currentXPosition, tableRowY, { width: tableColumnWidths[1], align: 'center' });
            currentXPosition += tableColumnWidths[1];
            
            doc.text(prixUnitaire, currentXPosition, tableRowY, { width: tableColumnWidths[2], align: 'center' });
            currentXPosition += tableColumnWidths[2];
            
            doc.text(prixTotal, currentXPosition, tableRowY, { width: tableColumnWidths[3], align: 'center' });
            currentXPosition += tableColumnWidths[3];
            
            doc.text(dateExpiration, currentXPosition, tableRowY, { width: tableColumnWidths[4], align: 'center' });
            
            tableRowY += 25;
          });
        }
      } else if (facture.type === 'consommation' && facture.articlesC) {
        const consommation = facture.articlesC;
        
        if (consommation && consommation.articlesC && consommation.articlesC.length > 0) {
          consommation.articlesC.forEach((article, index) => {
            const articleInfo = article.produit;
            const nomArticle = articleInfo && articleInfo.produit ? articleInfo.produit : 'Article inconnu';
            const quantite = article.quantite;
            const unite = articleInfo && articleInfo.unite ? articleInfo.unite : '';
            const quantiteAvecUnite = unite ? `${quantite} ${unite}` : quantite;
            
            // Alterner couleur de fond pour les lignes
            if (index % 2 === 0) {
              doc.rect(50, tableRowY - 5, doc.page.width - 100, 25)
                 .fill('#f9f9f9');
            }
            
            // Ajouter le contenu de la ligne
            currentXPosition = 50;
            doc.fillColor('#000')
               .text(nomArticle, currentXPosition, tableRowY, { width: tableColumnWidths[0], align:'center' });
            currentXPosition += tableColumnWidths[0];
            
            doc.text(quantiteAvecUnite, currentXPosition, tableRowY, { width: tableColumnWidths[1], align: 'center' });
            currentXPosition += tableColumnWidths[1];
            
            doc.text("0 DH", currentXPosition, tableRowY, { width: tableColumnWidths[2], align: 'center' });
            currentXPosition += tableColumnWidths[2];
            
            doc.text("0 DH", currentXPosition, tableRowY, { width: tableColumnWidths[3], align: 'center' });
            currentXPosition += tableColumnWidths[3];
            
            doc.text("N/A", currentXPosition, tableRowY, { width: tableColumnWidths[4], align: 'center' });
            
            tableRowY += 25;
          });
        }
      }
      
      // Finalisation du document
      doc.end();
    })
    .catch(error => {
      console.error('Erreur lors de la génération du PDF:', error);
      res.status(500).json({ error: error.message });
    });
};

// Importer une image pour une facture existante
exports.importFactureImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Aucune image fournie" });
    }

    // Trouver la facture
    const facture = await Facture.findById(id);
    if (!facture) {
      return res.status(404).json({ success: false, message: "Facture non trouvée" });
    }

    // Créer le dossier uploads/factures s'il n'existe pas
    const uploadDir = path.join(__dirname, '../../uploads/factures');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const fileName = `facture_${id}_${Date.now()}${path.extname(req.file.originalname)}`;
    const filePath = `factures/${fileName}`; // Chemin relatif pour accès via URL
    const fullPath = path.join(__dirname, '../../uploads', filePath);

    // Écrire le fichier sur le disque
    fs.writeFileSync(fullPath, req.file.buffer);

    // Initialiser le tableau image_path s'il n'existe pas
    if (!facture.image_path) {
      facture.image_path = [];
    }

    // Ajouter le nouveau chemin au tableau d'images
    facture.image_path.push(filePath);
    await facture.save();

    return res.status(200).json({
      success: true,
      message: "Image importée avec succès",
      facture
    });
  } catch (error) {
    console.error("Erreur lors de l'importation de l'image:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'importation de l'image",
      error: error.message
    });
  }
};

// Supprimer l'image d'une facture
exports.deleteFactureImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageIndex } = req.query;

    // Trouver la facture
    const facture = await Facture.findById(id);
    if (!facture) {
      return res.status(404).json({ success: false, message: "Facture non trouvée" });
    }

    // Vérifier si la facture a des images
    if (!facture.image_path || facture.image_path.length === 0) {
      return res.status(400).json({ success: false, message: "Cette facture n'a pas d'images à supprimer" });
    }

    // Vérifier si l'index est valide
    const index = parseInt(imageIndex, 10);
    if (isNaN(index) || index < 0 || index >= facture.image_path.length) {
      return res.status(400).json({ success: false, message: "Index d'image invalide" });
    }

    // Récupérer le chemin de l'image à supprimer
    const imagePath = facture.image_path[index];

    // Supprimer le fichier image
    try {
      fs.unlinkSync(path.join(__dirname, '../../uploads', imagePath));
    } catch (error) {
      console.error("Erreur lors de la suppression du fichier image:", error);
      // Continuer même si le fichier ne peut pas être supprimé
    }

    // Supprimer le chemin de l'image du tableau
    facture.image_path.splice(index, 1);
    await facture.save();

    return res.status(200).json({
      success: true,
      message: "Image supprimée avec succès",
      facture
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'image:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'image",
      error: error.message
    });
  }
};


