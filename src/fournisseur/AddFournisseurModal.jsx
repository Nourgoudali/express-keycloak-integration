import React, { useState } from "react";
import "../style/AddFournisseurModal.css";
import { fournisseurAPI } from "../services/api";

const AddFournisseurModal = ({ isOpen, onClose, onAddFournisseur }) => {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    ville: "",
    code_postal: "",
    address: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Valider les données du formulaire
      if (!formData.nom || !formData.address || !formData.ville || !formData.code_postal) {
        setError("Veuillez remplir tous les champs obligatoires");
        setLoading(false);
        return;
      }

      console.log("Données du formulaire avant envoi:", formData);
      
      // Appel à l'API pour créer le fournisseur
      const response = await fournisseurAPI.createFournisseur(formData);
      console.log("Réponse du serveur:", response);
      
      setLoading(false);
      
      // Notifier le composant parent du nouveau fournisseur
      if (onAddFournisseur) {
        // Vérifier si la réponse contient les données dans data ou directement
        const fournisseurData = response.data.data || response.data;
        onAddFournisseur(fournisseurData);
      }
      
      onClose();

      // Réinitialiser le formulaire
      setFormData({
        nom: "",
        email: "",
        telephone: "",
        ville: "",
        code_postal: "",
        address: ""
      });
    } catch (err) {
      console.error("Erreur lors de l'ajout du fournisseur:", err);
      setError(err.response?.data?.error || "Erreur lors de l'ajout du fournisseur");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Ajouter un fournisseur</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Nom du fournisseur"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ville *</label>
              <input
                type="text"
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                placeholder="Ville"
                required
              />
            </div>

            <div className="form-group">
              <label>Code Postal *</label>
              <input
                type="text"
                name="code_postal"
                value={formData.code_postal}
                onChange={handleChange}
                placeholder="Code postal"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Téléphone</label>
              <input
                type="text"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                placeholder="+212 5 XX XX XX XX"
              />
            </div>

            <div className="form-group">
              <label>Adresse *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Adresse complète"
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Ajout en cours..." : "Ajouter le fournisseur"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddFournisseurModal;
