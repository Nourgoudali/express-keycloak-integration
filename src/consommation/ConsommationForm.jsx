import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaMinus, FaPrint } from "react-icons/fa";
import "../style/ConsommationForm.css";
import { articleAPI, consommationAPI, factureAPI, anneeScolaireAPI } from "../services/api";

const ConsommationForm = () => {
  const [consommation, setConsommation] = useState({
    articlesC: [
      { 
        produit: "", 
        quantite: "", 
        type: "utilisation" 
      }
    ],
    annee: ""
  });
  const [categories, setCategories] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [isFactureCreated, setIsFactureCreated] = useState(false);
  const [factureData, setFactureData] = useState(null);
  const [articlesDetails, setArticlesDetails] = useState([]);
  
  const printRef = useRef();

  // Types de consommation
  const typesConsommation = [
    { value: "utilisation", label: "Utilisation" },
    { value: "endommage", label: "Endommage" },
    { value: "perime", label: "Périmé" },
    { value: "vol", label: "Vol" },
    { value: "don", label: "Don" }
  ];

  // Charger l'année scolaire active
  useEffect(() => {
    const loadActiveSchoolYear = async () => {
      try {
        const response = await anneeScolaireAPI.getActiveYear();
        if (response.data && response.data.success && response.data.activeYear) {
          setConsommation(prevState => ({
            ...prevState,
            annee: response.data.activeYear.annee
          }));
        }
      } catch (err) {
        console.error("Erreur lors du chargement de l'année scolaire active:", err);
      }
    };

    loadActiveSchoolYear();
  }, []);

  // Charger les articles depuis l'API
  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const response = await articleAPI.getAllArticles();
        setArticles(response.data);
        
        // Extraire les catégories uniques
        const uniqueCategories = [...new Set(response.data.map(article => article.categorie))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des articles:", err);
        setError("Erreur lors du chargement des articles");
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  // Options pour les articles basées sur la catégorie sélectionnée
  const getOptionsArticle = (categorie) => {
    return articles
      .filter(article => article.categorie === categorie)
      .map(article => ({
        value: article._id,
        label: article.produit
    }));
  };

  // Ajouter une ligne d'article
  const ajouterArticle = () => {
    setConsommation({
      ...consommation,
      articlesC: [...consommation.articlesC, { 
        produit: "", 
        quantite: "", 
        type: "utilisation" 
      }]
    });
  };

  // Supprimer une ligne d'article
  const supprimerArticle = (index) => {
    if (consommation.articlesC.length > 1) {
      const newArticlesC = [...consommation.articlesC];
      newArticlesC.splice(index, 1);
      setConsommation({
        ...consommation,
        articlesC: newArticlesC
      });
    }
  };

  // Mettre à jour les valeurs d'un article
  const handleArticleChange = (index, field, value) => {
    const newArticlesC = [...consommation.articlesC];
    newArticlesC[index] = {
      ...newArticlesC[index],
      [field]: value
    };
    
    setConsommation({
      ...consommation,
      articlesC: newArticlesC
    });
  };

  // Préparer le modal de vérification
  const prepareVerification = (e) => {
    e.preventDefault();
    
    // Vérifier que tous les champs requis sont remplis
    const isFormValid = consommation.annee && 
      consommation.articlesC.every(
        article => article.produit && article.quantite && article.type
      );
    
    if (isFormValid) {
      // Préparer les détails des articles pour l'affichage
      const details = consommation.articlesC.map(article => {
        const articleInfo = articles.find(a => a._id === article.produit);
        const typeInfo = typesConsommation.find(t => t.value === article.type);
        
        return {
          id: article.produit,
          nom: articleInfo ? articleInfo.produit : 'Article inconnu',
          quantite: article.quantite,
          unite: articleInfo ? articleInfo.unite : '',
          type: typeInfo ? typeInfo.label : article.type
        };
      });
      
      setArticlesDetails(details);
      setIsVerificationModalOpen(true);
    } else {
      alert("Veuillez remplir tous les champs pour chaque produit.");
    }
  };

  // Annuler la vérification
  const annulerVerification = () => {
    setIsVerificationModalOpen(false);
  };

  // Gérer la soumission du formulaire après vérification
  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Transformer les données pour correspondre à la structure attendue par l'API mise à jour
      const consommationData = {
        articlesC: consommation.articlesC.map(article => ({
          produit: article.produit,
          quantite: parseInt(article.quantite, 10),
          type: article.type
        })),
        annee: consommation.annee
      };

      console.log("Données de consommation envoyées:", consommationData);

      // Envoyer la requête au backend pour créer la consommation
      const consommationResponse = await consommationAPI.createConsommation(consommationData);
      console.log("Réponse de consommation:", consommationResponse.data);
      
      // La facture est déjà créée par le backend, nous la récupérons directement
      const { consommation: createdConsommation, facture: createdFacture } = consommationResponse.data;
      
      console.log("Consommation créée:", createdConsommation);
      console.log("Facture associée:", createdFacture);
      
      setFactureData({
        ...createdFacture,
        articles: articlesDetails,
        date: new Date(createdFacture.date).toLocaleDateString()
      });
      
      setIsFactureCreated(true);
      setIsVerificationModalOpen(false);
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors de l'ajout des consommations:", err);
      // Afficher plus de détails sur l'erreur
      if (err.response && err.response.data) {
        console.error("Détails de l'erreur:", err.response.data);
      }
      setError("Erreur lors de l'ajout des consommations");
      setLoading(false);
      setIsVerificationModalOpen(false);
      alert("Erreur lors de l'ajout des consommations: " + (err.response?.data?.error || err.message));
    }
  };

  // Afficher le chargement
  if (loading && (!articles.length)) {
    return <div className="loading">Chargement...</div>;
  }

  // Afficher l'erreur
  if (error) {
    return <div className="error">{error}</div>;
  }

  // Rendu du formulaire
  return (
    <div className="consommation-container">
      <h2 className="consommation-title">Produit consommé</h2>
      
      <form onSubmit={prepareVerification}>
        <div className="produits-list">
          {consommation.articlesC.map((article, index) => (
            <div key={index} className="produit-row">
              {consommation.articlesC.length > 1 && (
                <button 
                  type="button" 
                  className="remove-button" 
                  onClick={() => supprimerArticle(index)}
                  aria-label="Supprimer ce produit"
                >
                  <FaMinus />
                </button>
              )}
              
              <div className="produit-inputs">
                <div className="select-container">
                    <select
                    value={article.categorie || ""}
                    onChange={(e) => handleArticleChange(index, "categorie", e.target.value)}
                      className="produit-select"
                    required
                  >
                    <option value="" disabled>
                      Catégorie
                    </option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                        </option>
                      ))}
                    </select>
                </div>
                
                <div className="select-container">
                    <select
                    value={article.produit}
                    onChange={(e) => handleArticleChange(index, "produit", e.target.value)}
                      className="produit-select"
                    disabled={!article.categorie}
                    required
                  >
                    <option value="" disabled>
                      Article
                    </option>
                    {getOptionsArticle(article.categorie).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                </div>
                
                <input
                  type="number"
                  value={article.quantite}
                  onChange={(e) => handleArticleChange(index, "quantite", e.target.value)}
                  placeholder="Quantité"
                  className="quantite-input"
                  disabled={!article.produit}
                  required
                />

                <div className="select-container">
                  <select
                    value={article.type}
                    onChange={(e) => handleArticleChange(index, "type", e.target.value)}
                    className="produit-select"
                    disabled={!article.quantite}
                    required
                  >
                    {typesConsommation.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {index === consommation.articlesC.length - 1 && (
                  <button 
                    type="button" 
                    className="add-button" 
                    onClick={ajouterArticle}
                    aria-label="Ajouter un produit"
                  >
                    <FaPlus />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Vérification..." : "Ajouter"}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => setConsommation({
              articlesC: [{ produit: "", quantite: "", type: "utilisation" }],
              annee: consommation.annee // Garder l'année scolaire active
            })}
            disabled={loading}
          >
            Annuler
          </button>
        </div>
      </form>

      {/* Modal de vérification */}
      {isVerificationModalOpen && (
        <div className="verification-modal-overlay">
          <div className="verification-modal-content">
            <h3>Vérification des produits à consommer</h3>
            
            <table className="verification-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Quantité</th>
                  <th>Unité</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {articlesDetails.map((article, index) => (
                  <tr key={index}>
                    <td>{article.nom}</td>
                    <td>{article.quantite}</td>
                    <td>{article.unite}</td>
                    <td>{article.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="verification-actions">
              <button 
                className="validate-button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Validation en cours..." : "Valider"}
              </button>
              <button 
                className="cancel-verification-button"
                onClick={annulerVerification}
                disabled={loading}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsommationForm; 
