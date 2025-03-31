const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Importer le modèle Article
const Article = require('../models/articleModel');

// Connexion à la base de données
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ofppt-internat', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connexion à MongoDB réussie');
    importArticles();
  })
  .catch((err) => {
    console.error('Erreur de connexion à MongoDB :', err);
    process.exit(1);
  });

// Fonction pour normaliser la catégorie selon les valeurs d'énumération autorisées
function normalizeCategorie(categorie) {
  const categorieUpper = categorie.toUpperCase();
  if (categorieUpper.includes('EPICERIE')) {
    return 'Epicerie';
  } else if (categorieUpper.includes('FRUIT') || categorieUpper.includes('LEGUME')) {
    return 'Fruits et Légumes';
  } else if (categorieUpper.includes('VIANDE') || categorieUpper.includes('BOEUF') || categorieUpper.includes('BŒUF')) {
    return 'Viandes & Boeufs';
  } else if (categorieUpper.includes('POISSON')) {
    return 'Poisson';
  } else {
    return 'Autres';
  }
}

// Fonction pour normaliser l'unité selon les valeurs d'énumération autorisées
function normalizeUnite(unite) {
  const uniteUpper = unite.toUpperCase();
  if (uniteUpper.includes('KG')) {
    return 'kg';
  } else if (uniteUpper.includes('G') && !uniteUpper.includes('KG')) {
    return 'g';
  } else if (uniteUpper.includes('L') && !uniteUpper.includes('BL')) {
    return 'l';
  } else if (uniteUpper.includes('BOITE') || uniteUpper.includes('BOÎTE')) {
    return 'boite';
  } else if (uniteUpper.includes('PAQUET')) {
    return 'paquet';
  } else {
    return 'unite'; // Valeur par défaut
  }
}

async function importArticles() {
  try {
    // Chemin vers le fichier Excel
    const excelFilePath = path.join(__dirname, '../data/Ofppt-Internat.xlsx');
    
    // Vérifier si le fichier existe
    if (!fs.existsSync(excelFilePath)) {
      console.error('Fichier Excel non trouvé:', excelFilePath);
      process.exit(1);
    }
    
    console.log('Lecture du fichier Excel:', excelFilePath);
    
    // Lire le fichier Excel avec des options pour voir toutes les cellules
    const workbook = XLSX.readFile(excelFilePath, { cellDates: true, cellNF: false, cellText: false });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Récupérer les données de manière plus détaillée pour voir les cellules
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 'A', defval: '' });
    
    if (!jsonData.length) {
      console.error('Le fichier Excel ne contient pas de données');
      process.exit(1);
    }
    
    console.log(`${jsonData.length} lignes trouvées dans le fichier Excel`);
    
    // Afficher quelques lignes pour comprendre la structure
    console.log('Premières lignes:');
    for (let i = 0; i < Math.min(5, jsonData.length); i++) {
      console.log(`Ligne ${i}:`, jsonData[i]);
    }
    
    // Trouver les colonnes qui contiennent probablement le nom des articles et les unités
    // Généralement, ils se trouvent dans les premières colonnes
    let articleIndex = null;
    let uniteIndex = null;
    let categorieIndex = null;
    
    // Analyser les en-têtes (premières lignes) pour trouver les indices de colonnes
    for (let i = 0; i < Math.min(10, jsonData.length); i++) {
      for (const [key, value] of Object.entries(jsonData[i])) {
        if (typeof value === 'string') {
          const valueUpper = value.toUpperCase();
          if (valueUpper.includes('ARTICLE') || valueUpper.includes('PRODUIT') || valueUpper.includes('DESIGNATION')) {
            articleIndex = key;
          } else if (valueUpper.includes('UNITE') || valueUpper.includes('UNIT')) {
            uniteIndex = key;
          } else if (valueUpper.includes('CATEGORIE') || valueUpper.includes('GRPE') || valueUpper.includes('GROUP')) {
            categorieIndex = key;
          }
        }
      }
      if (articleIndex && uniteIndex) break; // Si on a trouvé les colonnes principales, on arrête
    }
    
    // Si l'unité n'est pas trouvée, mais que la colonne C existe souvent à côté de B (articles), on la considère comme unité
    if (articleIndex === 'B' && !uniteIndex) {
      uniteIndex = 'C';
    }
    
    // Si la catégorie n'est pas trouvée, mais que la colonne A existe, on la considère comme catégorie potentielle
    if (articleIndex === 'B' && !categorieIndex) {
      categorieIndex = 'A';
    }
    
    console.log('Indices trouvés - Article:', articleIndex, 'Unité:', uniteIndex, 'Catégorie:', categorieIndex);
    
    // S'il n'y a pas d'indice d'article trouvé, chercher la colonne qui contient le plus de texte
    if (!articleIndex) {
      const columnTextCounts = {};
      
      // Analyser les 20 premières lignes pour identifier les colonnes avec du texte
      for (let i = 5; i < Math.min(30, jsonData.length); i++) {
        for (const [key, value] of Object.entries(jsonData[i])) {
          if (typeof value === 'string' && value.trim() !== '') {
            columnTextCounts[key] = (columnTextCounts[key] || 0) + 1;
          }
        }
      }
      
      console.log('Comptage de texte par colonne:', columnTextCounts);
      
      // Trouver la colonne avec le plus de texte
      let maxCount = 0;
      for (const [key, count] of Object.entries(columnTextCounts)) {
        if (count > maxCount) {
          maxCount = count;
          articleIndex = key;
        }
      }
      
      console.log('Indice d\'article déterminé par comptage de texte:', articleIndex);
    }
    
    // Vider la collection des articles existants
    await Article.deleteMany({});
    console.log('Collection Articles vidée');
    
    // Si on a trouvé une colonne d'articles, on peut procéder à l'extraction
    if (articleIndex) {
      // Préparer les articles en ignorant les premières lignes d'en-tête (généralement 5)
      const articlesToSave = [];
      let currentCategorie = 'Non catégorisé';
      
      // Lire tout le fichier Excel pour identifier les catégories correctement
      let categorieLines = [];
      for (let i = 3; i < jsonData.length; i++) {
        const row = jsonData[i];
        // Si la colonne A contient une valeur et la colonne B est vide, c'est probablement une catégorie
        if (row['A'] && row['A'].trim() !== '' && (!row['B'] || row['B'].trim() === '')) {
          categorieLines.push({ index: i, categorie: row['A'] });
        }
      }
      
      console.log('Catégories détectées:', categorieLines.map(c => c.categorie));
      
      // Déterminer la catégorie de chaque ligne en fonction de sa position entre les lignes de catégorie
      for (let i = 3; i < jsonData.length; i++) {
        const row = jsonData[i];
        const articleName = row[articleIndex];
        
        // Trouver la catégorie applicable à cette ligne
        for (let j = categorieLines.length - 1; j >= 0; j--) {
          if (i >= categorieLines[j].index) {
            currentCategorie = categorieLines[j].categorie;
            break;
          }
        }
        
        // Si une ligne a une valeur dans la colonne A et B, prendre A comme catégorie pour cette ligne
        if (categorieIndex && row[categorieIndex] && row[categorieIndex].trim() !== '') {
          if (categorieIndex === 'A' && row['A'] !== articleName) { // Éviter de prendre le nom de l'article comme catégorie
            currentCategorie = row[categorieIndex];
          }
        }
        
        // Vérifier si c'est une ligne d'article valide
        if (articleName && articleName.trim() !== '' && 
            articleName.toUpperCase() !== 'ARTICLE' && 
            articleName.toUpperCase() !== 'PRODUIT' && 
            articleName.toUpperCase() !== 'ARTICLES' && 
            articleName.toUpperCase() !== 'DESIGNATION') {
          
          // Forcer l'utilisation de la colonne C pour l'unité si articleIndex est B
          const uniteRaw = articleIndex === 'B' ? row['C'] || 'unite' : (uniteIndex ? row[uniteIndex] || 'unite' : 'unite');
          
          // Normaliser la valeur de la catégorie et de l'unité
          const normalizedCategorie = normalizeCategorie(currentCategorie);
          const normalizedUnite = normalizeUnite(uniteRaw);
          
          articlesToSave.push({
            categorie: normalizedCategorie,
            produit: articleName,
            quantite: 0, // Défini à 0 selon les exigences
            unite: normalizedUnite,
            minStock: 0, // Défini à 0 selon les exigences
            maxStock: 100, // Défini à 100 selon les exigences
            statut: 'Faible stock' // Statut avec F majuscule
          });
        }
      }
      
      console.log(`${articlesToSave.length} articles valides à importer`);
      
      if (articlesToSave.length === 0) {
        console.error('Aucun article valide à importer');
        mongoose.disconnect();
        process.exit(1);
      }
      
      // Insérer les données dans MongoDB
      const savedArticles = await Article.insertMany(articlesToSave);
      
      console.log(`${savedArticles.length} articles importés avec succès dans la base de données`);
    } else {
      console.error('Impossible de déterminer la colonne des articles dans le fichier Excel');
    }
    
    // Déconnexion de la base de données
    mongoose.disconnect();
    console.log('Déconnexion de MongoDB');
  } catch (error) {
    console.error('Erreur lors de l\'importation du fichier Excel:', error);
    mongoose.disconnect();
    process.exit(1);
  }
} 