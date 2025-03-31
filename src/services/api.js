import axios from 'axios';

// Configuration de base d'axios
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Adapter l'URL selon votre configuration
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour gérer les erreurs
API.interceptors.response.use(
  response => response,
  error => {
    console.error('Erreur API:', error.message);
    return Promise.reject(error);
  }
);

// API pour les articles (produits)
export const articleAPI = {
  // Récupérer tous les articles
  getAllArticles: () => API.get('/articles').then(response => {
    // S'assurer que la réponse est bien un tableau
    if (response.data && !Array.isArray(response.data)) {
      console.warn('Réponse API articles inattendue:', response.data);
      // Si la réponse a une structure similaire à celle des fournisseurs
      if (response.data.success && Array.isArray(response.data.data)) {
        response.data = response.data.data;
      } else {
        // Sinon, retourner un tableau vide pour éviter l'erreur
        response.data = [];
      }
    }
    return response;
  }),
  // Récupérer un article par son ID
  getArticleById: (id) => API.get(`/articles/${id}`),
  // Créer un nouvel article
  createArticle: (articleData) => API.post('/articles', articleData),
  // Mettre à jour un article
  updateArticle: (id, articleData) => API.put(`/articles/${id}`, articleData),
  // Supprimer un article
  deleteArticle: (id) => API.delete(`/articles/${id}`),
  // Importer des articles depuis un fichier Excel
  importArticlesFromExcel: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return API.post('/articles/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  // Importer des articles depuis le fichier Excel local du serveur
  importLocalExcel: () => API.get('/articles/import-local'),
};

// API pour les achats
export const achatAPI = {
  // Récupérer tous les achats
  getAllAchats: () => API.get('/achats'),
  // Récupérer un achat par ID
  getAchatById: (id) => API.get(`/achats/${id}`),
  // Créer un nouvel achat
  createAchat: (achatData, image) => {
    const formData = new FormData();
    
    // Ajouter les données de l'achat
    Object.keys(achatData).forEach(key => {
      // Pour les tableaux (comme articlesA), les convertir en JSON
      if (Array.isArray(achatData[key])) {
        formData.append(key, JSON.stringify(achatData[key]));
      } else {
        formData.append(key, achatData[key]);
      }
    });
    
    // Ajouter l'image si elle existe
    if (image) {
      formData.append('image', image);
    }
    
    return API.post('/achats', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  // Mettre à jour un achat
  updateAchat: (id, achatData) => API.put(`/achats/${id}`, achatData),
  // Supprimer un achat
  deleteAchat: (id) => API.delete(`/achats/${id}`),
};

// API pour les consommations
export const consommationAPI = {
  // Récupérer toutes les consommations
  getAllConsommations: () => API.get('/consommations'),
  // Créer une nouvelle consommation
  createConsommation: (consommationData) => API.post('/consommations', consommationData),
  // Mettre à jour une consommation
  updateConsommation: (id, consommationData) => API.put(`/consommations/${id}`, consommationData),
  // Supprimer une consommation
  deleteConsommation: (id) => API.delete(`/consommations/${id}`),
};

// API pour les fournisseurs
export const fournisseurAPI = {
  // Récupérer tous les fournisseurs
  getAllFournisseurs: () => API.get('/fournisseurs').then(response => {
    // La réponse du backend est formatée comme { success: true, count: X, data: [...] }
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      // Extraire le tableau de fournisseurs de la structure de réponse
      response.data = response.data.data;
    } else if (response.data && !Array.isArray(response.data)) {
      console.warn('Réponse API fournisseurs inattendue:', response.data);
      // Si la réponse n'est pas un tableau et ne suit pas le format attendu, retourner un tableau vide
      response.data = [];
    }
    return response;
  }),
  // Récupérer un fournisseur par son ID
  getFournisseurById: (id) => API.get(`/fournisseurs/${id}`),
  // Créer un nouveau fournisseur
  createFournisseur: (fournisseurData) => API.post('/fournisseurs', fournisseurData),
  // Mettre à jour un fournisseur
  updateFournisseur: (id, fournisseurData) => API.put(`/fournisseurs/${id}`, fournisseurData),
  // Supprimer un fournisseur
  deleteFournisseur: (id) => API.delete(`/fournisseurs/${id}`),
};

// API pour les factures
export const factureAPI = {
  // Récupérer toutes les factures
  getAllFactures: (schoolYear) => {
    // Si une année scolaire est fournie, l'ajouter comme paramètre de requête
    if (schoolYear) {
      return API.get(`/factures?annee=${encodeURIComponent(schoolYear)}`);
    }
    return API.get('/factures');
  },
  // Récupérer une facture par son ID
  getFactureById: (id) => API.get(`/factures/${id}`),
  // Créer une nouvelle facture
  createFacture: (factureData, image) => {
    const formData = new FormData();
    
    // Ajouter les données de la facture
    Object.keys(factureData).forEach(key => {
      // Pour les tableaux (achats, consommations), les convertir en JSON
      if (Array.isArray(factureData[key])) {
        formData.append(key, JSON.stringify(factureData[key]));
      } else {
        formData.append(key, factureData[key]);
      }
    });
    
    // Ajouter l'image si elle existe
    if (image) {
      formData.append('image', image);
    }
    
    return API.post('/factures', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  // Supprimer une facture
  // Télécharger le PDF d'une facture
  downloadFacturePDF: (id) => API.get(`/factures/${id}/pdf`, { responseType: 'blob' }),
  // Importer une image pour une facture existante
  importFactureImage: (id, image) => {
    const formData = new FormData();
    formData.append('image', image);
    
    return API.post(`/factures/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  // Supprimer l'image d'une facture
  deleteFactureImage: (id, imageIndex) => API.delete(`/factures/${id}/image?imageIndex=${imageIndex}`),
};

// API pour les années
export const anneeScolaireAPI = {
  // Récupérer toutes les années scolaires
  getAllYears: () => API.get('/annees-scolaires/all'),
  // Récupérer l'année scolaire active
  getActiveYear: () => API.get('/annees-scolaires/active'),
  // Vérifier et mettre à jour l'année scolaire active si nécessaire
  updateActiveYear: () => API.get('/annees-scolaires/update'),
};

export default {
  articleAPI,
  achatAPI,
  consommationAPI,
  fournisseurAPI,
  factureAPI,
  anneeScolaireAPI,
}; 