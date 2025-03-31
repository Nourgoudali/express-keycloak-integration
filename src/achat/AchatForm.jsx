import React, { useState, useEffect } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import "../style/AchatForm.css";
import { fournisseurAPI, articleAPI, achatAPI, anneeScolaireAPI } from "../services/api";

const AchatForm = () => {
  const [achat, setAchat] = useState({
    id_fournisseur: "",
    annee: "",
    articlesA: [
      {
        produit: "",
        quantite: "",
        prix: "",
        date_expiration: "",
      },
    ],
  });
  const [fournisseurs, setFournisseurs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Charger l'année scolaire active
  useEffect(() => {
    const loadActiveSchoolYear = async () => {
      try {
        const response = await anneeScolaireAPI.getActiveYear();
        if (response.data && response.data.success && response.data.activeYear) {
          setAchat(prevState => ({
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

  // Charger les fournisseurs depuis l'API
  useEffect(() => {
    const loadFournisseurs = async () => {
      try {
        setLoading(true);
        const response = await fournisseurAPI.getAllFournisseurs();
        // S'assurer que fournisseurs est un tableau
        const fournisseursData = Array.isArray(response.data) ? response.data : [];
        console.log('Fournisseurs chargés:', fournisseursData);
        setFournisseurs(fournisseursData);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des fournisseurs:", err);
        setError("Erreur lors du chargement des fournisseurs");
        setLoading(false);
        // Initialiser avec un tableau vide en cas d'erreur
        setFournisseurs([]);
      }
    };

    loadFournisseurs();
  }, []);

  // Charger les articles depuis l'API
  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const response = await articleAPI.getAllArticles();
        // S'assurer que articles est un tableau
        const articlesData = Array.isArray(response.data) ? response.data : [];
        setArticles(articlesData);
        
        // Extraire les catégories uniques
        const uniqueCategories = [...new Set(articlesData.map(article => article.categorie))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des articles:", err);
        setError("Erreur lors du chargement des articles");
        setLoading(false);
        // Initialiser avec un tableau vide en cas d'erreur
        setArticles([]);
        setCategories([]);
      }
    };

    loadArticles();
  }, []);

  // Options pour les fournisseurs
  const optionsFournisseur = Array.isArray(fournisseurs) 
    ? fournisseurs.map(f => ({
        value: f._id,
        label: f.nom
      }))
    : [];

  // Options pour les articles basées sur la catégorie sélectionnée
  const getOptionsArticle = (categorie) => {
    if (!Array.isArray(articles)) return [];
    
    return articles
      .filter(article => article.categorie === categorie)
      .map(article => ({
        value: article._id,
        label: article.produit
      }));
  };

  // Ajouter une ligne d'article
  const ajouterLigne = () => {
    setAchat({
      ...achat,
      articlesA: [...achat.articlesA, {
        produit: "",
        quantite: "",
        prix: "",
        date_expiration: "",
      }]
    });
  };

  // Supprimer une ligne d'article
  const supprimerLigne = (index) => {
    if (achat.articlesA.length > 1) {
      const newArticlesA = [...achat.articlesA];
      newArticlesA.splice(index, 1);
      setAchat({
        ...achat,
        articlesA: newArticlesA
      });
    }
  };
  
  // Mettre à jour les valeurs d'un article
  const handleArticleChange = (index, field, value) => {
    const newArticlesA = [...achat.articlesA];
    newArticlesA[index] = {
      ...newArticlesA[index],
      [field]: value
    };
    
    setAchat({
      ...achat,
      articlesA: newArticlesA
    });
  };

  // Mettre à jour la valeur du fournisseur
  const handleFournisseurChange = (value) => {
    setAchat({
      ...achat,
      id_fournisseur: value
    });
  };

  // Calcul du prix total
  const calculerTotal = () => {
    return achat.articlesA.reduce((total, article) => {
      const prix = parseFloat(article.prix) || 0;
      const quantite = parseInt(article.quantite) || 0;
      return total + (prix * quantite);
    }, 0).toFixed(2);
  };

  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Vérifier que tous les champs requis sont remplis
    const isFormValid = 
      achat.id_fournisseur && 
      achat.annee &&
      achat.articlesA.every(article => 
        article.produit && 
        article.quantite && 
        article.prix && 
        article.date_expiration
      );

    if (isFormValid) {
      // Afficher le modal de confirmation au lieu d'envoyer directement
      setShowConfirmation(true);
    } else {
      alert("Veuillez remplir tous les champs pour chaque ligne de l'achat.");
    }
  };

  // Nouvelle fonction pour envoyer les données après confirmation
  const confirmAndSubmit = async () => {
    try {
      setLoading(true);
      
      // Transformer les données pour correspondre à la structure attendue par l'API
      const achatData = {
        id_fournisseur: achat.id_fournisseur,
        annee: achat.annee,
        articlesA: achat.articlesA.map(article => ({
          produit: article.produit,
          quantite: parseInt(article.quantite, 10),
          prix: parseFloat(article.prix),
          date_expiration: article.date_expiration
        }))
      };

      console.log("Données d'achat à envoyer:", achatData);

      // Envoyer la requête au backend avec FormData
      const response = await achatAPI.createAchat(achatData, null);
      
      setLoading(false);
      setShowConfirmation(false); // Fermer le modal
      alert("Achat ajouté avec succès !");
      
      // Réinitialiser le formulaire après soumission réussie
      setAchat({
        id_fournisseur: "",
        annee: achat.annee, // Garder l'année scolaire active
        articlesA: [
          {
            produit: "",
            quantite: "",
            prix: "",
            date_expiration: "",
          },
        ]
      });
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'achat:", err);
      setError("Erreur lors de l'ajout de l'achat");
      setLoading(false);
      setShowConfirmation(false); // Fermer le modal en cas d'erreur
      alert("Erreur lors de l'ajout de l'achat: " + (err.response?.data?.error || err.message));
    }
  };

  // Annuler le formulaire
  const handleCancel = () => {
    setAchat({
      id_fournisseur: "",
      annee: achat.annee, // Garder l'année scolaire active
      articlesA: [
        {
          produit: "",
          quantite: "",
          prix: "",
          date_expiration: "",
        },
      ]
    });
  };

  // Afficher le chargement
  if (loading && (!fournisseurs.length || !articles.length)) {
    return <div className="loading">Chargement...</div>;
  }

  // Afficher l'erreur
  if (error) {
    return <div className="error">{error}</div>;
  }

  // Rendu du formulaire
  return (
    <div className="achat-container">
      <h2 className="achat-title">Ajouter un Achat</h2>

      <form onSubmit={handleSubmit}>
        <div className="achat-form">
          {achat.articlesA.map((article, index) => (
            <div key={index} className="achat-row">
              {achat.articlesA.length > 1 && (
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => supprimerLigne(index)}
                >
                  <FaMinus />
                </button>
              )}
              <div className="achat-inputs">
                <div className="select-container">
                  <select
                    value={achat.id_fournisseur}
                    onChange={(e) => handleFournisseurChange(e.target.value)}
                    className="achat-select"
                    disabled={index !== 0}
                    required
                  >
                    <option value="" disabled>
                      Nom du fournisseur
                    </option>
                    {optionsFournisseur.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="select-container">
                  <select
                    value={article.categorie || ""}
                    onChange={(e) => handleArticleChange(index, "categorie", e.target.value)}
                    className="achat-select"
                    disabled={!achat.id_fournisseur}
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
                    className="achat-select"
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

                <input
                  type={article.date_expiration ? "date" : "text"}
                  value={article.date_expiration}
                  onChange={(e) => handleArticleChange(index, "date_expiration", e.target.value)}
                  onFocus={(e) => (e.target.type = "date")}
                  placeholder="Date d'expiration"
                  className="date-input"
                  disabled={!article.quantite}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />

                <input
                  type="number"
                  value={article.prix}
                  onChange={(e) => handleArticleChange(index, "prix", e.target.value)}
                  placeholder="Prix"
                  className="prix-input"
                  disabled={!article.date_expiration}
                  required
                />

                {index === achat.articlesA.length - 1 && (
                  <button
                    type="button"
                    className="add-button"
                    onClick={ajouterLigne}
                    aria-label="Ajouter une ligne"
                  >
                    <FaPlus />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="total-section">
          <h3 className="total-label">Total : <span className="total-amount">{calculerTotal()} DH</span></h3>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Ajout en cours..." : "Ajouter"}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
            disabled={loading}
          >
            Annuler
          </button>
        </div>
      </form>

      {/* Modal de confirmation */}
      {showConfirmation && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Confirmer l'achat</h3>
            
            <table className="confirmation-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Date d'expiration</th>
                  <th>Prix total</th>
                </tr>
              </thead>
              <tbody>
                {achat.articlesA.map((article, index) => {
                  const articleInfo = articles.find(a => a._id === article.produit);
                  const nomArticle = articleInfo ? articleInfo.produit : 'Article inconnu';
                  const prixTotal = parseFloat(article.prix) * parseInt(article.quantite);
                  
                  return (
                    <tr key={index}>
                      <td>{nomArticle}</td>
                      <td>{article.quantite}</td>
                      <td>{article.prix} DH</td>
                      <td>{new Date(article.date_expiration).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'right' }}>{prixTotal.toFixed(2)} DH</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <div className="confirmation-total">
              <span className="total-label">Total :</span>
              <span className="total-amount">{calculerTotal()} DH</span>
            </div>
            
            <div className="modal-actions">
              <button 
                type="button" 
                className="submit-button" 
                onClick={confirmAndSubmit}
                disabled={loading}
              >
                {loading ? "Ajout en cours..." : "Confirmer"}
              </button>
              <button 
                type="button" 
                className="cancel-button" 
                onClick={() => setShowConfirmation(false)}
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

export default AchatForm;
