import React, { useState } from "react";
import "../style/AddProductModal.css";
import { articleAPI } from "../services/api";

const AddProductModal = ({ isOpen, onClose, onAddSuccess }) => {
  const [formData, setFormData] = useState({
    categorie: "",
    produit: "",
    quantite: 0,
    unite: "",
    minStock: 0,
    maxStock: 100,
    statut: "Faible stock"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = ["Epicerie", "Fruits et Légumes", "Viandes & Boeufs", "Poisson", "Autres"];
  const unites = ["kg", "g", "l", "unite", "boite", "paquet"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedData = {
      ...formData,
      [name]: name === "quantite" || name === "minStock" || name === "maxStock" 
               ? parseInt(value, 10) 
               : value
    };
    
    // Mettre à jour automatiquement le statut en fonction de la quantité et du stock minimum
    if (name === "quantite" || name === "minStock") {
      updatedData.statut = parseInt(updatedData.quantite, 10) <= parseInt(updatedData.minStock, 10) 
                           ? "Faible stock" 
                           : "En stock";
    }
    
    setFormData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Préparation des données pour l'API
      const articleData = {
        categorie: formData.categorie,
        produit: formData.produit,
        quantite: parseInt(formData.quantite, 10),
        unite: formData.unite,
        minStock: parseInt(formData.minStock, 10),
        maxStock: parseInt(formData.maxStock, 10),
        statut: formData.quantite <= formData.minStock ? "Faible stock" : "En stock"
      };

      // Appel à l'API pour créer l'article
      await articleAPI.createArticle(articleData);
      
      setLoading(false);
      
      // Fermer le modal et réinitialiser le formulaire
      onClose();
      if (onAddSuccess) onAddSuccess();
      
      // Réinitialiser le formulaire
      setFormData({
        categorie: "",
        produit: "",
        quantite: 0,
        unite: "",
        minStock: 0,
        maxStock: 100,
        statut: "En stock"
      });
    } catch (err) {
      console.error("Erreur lors de l'ajout du produit:", err);
      setError("Erreur lors de l'ajout du produit. Veuillez réessayer.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Ajouter un produit</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Catégorie</label>
            <select
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Produit</label>
            <input
              type="text"
              name="produit"
              value={formData.produit}
              onChange={handleChange}
              placeholder="Entrer le nom du produit"
              required
            />
          </div>

          <div className="form-group">
            <label>Quantité</label>
            <input
              type="number"
              name="quantite"
              value={formData.quantite}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Unité</label>
            <select 
              name="unite" 
              value={formData.unite} 
              onChange={handleChange}
              required
            >
              <option value="">Sélectionner une unité</option>
              {unites.map(unite => (
                <option key={unite} value={unite}>{unite === "unite" ? "Unité" : unite}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label>Quantité minimum</label>
              <input
                type="number"
                name="minStock"
                value={formData.minStock}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            <div className="form-group half">
              <label>Quantité maximum</label>
              <input
                type="number"
                name="maxStock"
                value={formData.maxStock}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Statut</label>
            <div className={`status-badge ${formData.statut === "En stock" ? "status-in-stock" : "status-low-stock"}`}>
              {formData.statut}
            </div>
            <div className="status-help">
              Le statut est automatiquement déterminé en fonction de la quantité et du stock minimum.
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Ajout en cours..." : "Ajouter le produit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
