import React, { useState, useEffect } from "react";
import { FaEye, FaUpload, FaTrash } from "react-icons/fa";
import { FaFilePdf } from "react-icons/fa6";
import "../style/FactureTable.css";
import { factureAPI, anneeScolaireAPI} from "../services/api";

const FactureTable = ({ filter, selectedYear }) => {
  const [factures, setFactures] = useState([]);
  const [filteredFactures, setFilteredFactures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [activeSchoolYear, setActiveSchoolYear] = useState(null);

  // Charger l'année scolaire active au chargement du composant
  useEffect(() => {
    fetchActiveSchoolYear();
  }, []);

  // Récupérer l'année scolaire active
  const fetchActiveSchoolYear = async () => {
    try {
      const response = await anneeScolaireAPI.getActiveYear();
      if (response.data && response.data.success) {
        setActiveSchoolYear(response.data.activeYear.annee);
      }
    } catch (err) {
      console.error("Erreur lors du chargement de l'année scolaire active:", err);
    }
  };

  // Charger les factures lorsque l'année scolaire active change
  useEffect(() => {
    if (activeSchoolYear) {
      fetchFactures();
    }
  }, [activeSchoolYear, selectedYear]);

  // Fonction pour récupérer toutes les factures
  const fetchFactures = async () => {
    try {
      setLoading(true);
      // Utiliser l'année sélectionnée si disponible, sinon utiliser l'année active
      const yearToUse = selectedYear || activeSchoolYear;
      
      // Passer l'année en paramètre pour filtrer les factures côté serveur
      const response = await factureAPI.getAllFactures(yearToUse);
      console.log('Réponse factures:', response.data);
      setFactures(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des factures:", err);
      setError("Erreur lors du chargement des factures. Veuillez réessayer.");
      setLoading(false);
    }
  };

  // Filtrer les factures en fonction du filtre sélectionné
  useEffect(() => {
    if (filter === "tous") {
      setFilteredFactures(factures);
    } else {
      const filtered = factures.filter(
        facture => facture.type.toLowerCase() === filter
      );
      setFilteredFactures(filtered);
    }
  }, [filter, factures]);

  // Ouvrir la modal pour voir les détails d'une facture
  const handleViewDetails = async (facture) => {
    try {
      setLoading(true);
      // Récupérer les détails complets de la facture
      const response = await factureAPI.getFactureById(facture._id);
      const factureDetails = response.data;
      
      setSelectedFacture(factureDetails);
      
      // Convertir les chemins d'images en URLs complètes
      if (factureDetails.image_path && factureDetails.image_path.length > 0) {
        const images = factureDetails.image_path.map(path => 
          `http://localhost:5000/uploads/${path.replace('uploads/', '')}`
        );
        setSelectedImages(images);
      } else {
        setSelectedImages([]);
      }
      
      setShowDetailsModal(true);
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du chargement des détails de la facture:", err);
      setError("Erreur lors du chargement des détails. Veuillez réessayer.");
      setLoading(false);
    }
  };

  // Fermer la modal de détails
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedFacture(null);
    setSelectedImages([]);
  };

  // Gérer l'importation d'une image
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file && selectedFacture) {
      try {
        // Envoyer l'image au serveur
        setLoading(true);
        await factureAPI.importFactureImage(selectedFacture._id, file);
        
        // Recharger les détails de la facture pour obtenir le nouveau chemin d'image
        const response = await factureAPI.getFactureById(selectedFacture._id);
        const updatedFacture = response.data;
        setSelectedFacture(updatedFacture);
        
        // Mettre à jour les images affichées
        if (updatedFacture.image_path && updatedFacture.image_path.length > 0) {
          const images = updatedFacture.image_path.map(path => 
            `http://localhost:5000/uploads/${path.replace('uploads/', '')}`
          );
          setSelectedImages(images);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de l'importation de l'image:", err);
        setError("Erreur lors de l'importation de l'image. Veuillez réessayer.");
        setLoading(false);
      }
    }
  };

  // Supprimer l'image d'une facture
  const handleDeleteImage = async (imageIndex) => {
    if (!selectedFacture) return;
    
    try {
      setLoading(true);
      await factureAPI.deleteFactureImage(selectedFacture._id, imageIndex);
      
      // Recharger les détails de la facture pour mettre à jour l'affichage
      const response = await factureAPI.getFactureById(selectedFacture._id);
      const updatedFacture = response.data;
      setSelectedFacture(updatedFacture);
      
      // Mettre à jour les images affichées
      if (updatedFacture.image_path && updatedFacture.image_path.length > 0) {
        const images = updatedFacture.image_path.map(path => 
          `http://localhost:5000/uploads/${path.replace('uploads/', '')}`
        );
        setSelectedImages(images);
      } else {
        setSelectedImages([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors de la suppression de l'image:", err);
      setError("Erreur lors de la suppression de l'image. Veuillez réessayer.");
      setLoading(false);
    }
  };

  // Générer et télécharger un PDF
  const handleGeneratePDF = async () => {
    if (!selectedFacture) return;
    
    try {
      window.open(`http://localhost:5000/api/factures/${selectedFacture._id}/pdf`, '_blank');
    } catch (err) {
      console.error("Erreur lors de la génération du PDF:", err);
      setError("Erreur lors de la génération du PDF. Veuillez réessayer.");
    }
  };

  // Formatage de date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Déterminer les articles à afficher selon le type de facture
  const getArticles = (facture) => {
    if (!facture) return [];
    
    if (facture.type === 'achat' && facture.articlesA && facture.articlesA.length > 0) {
      const achat = facture.articlesA[0];
      return achat && achat.articlesA ? achat.articlesA : [];
    } else if (facture.type === 'consommation' && facture.articlesC) {
      return facture.articlesC.articlesC || [];
    }
    
    return [];
  };

  // Obtenir le nom du fournisseur (pour les factures d'achat)
  const getFournisseurNom = (facture) => {
    if (!facture || facture.type !== 'achat' || !facture.articlesA || facture.articlesA.length === 0) {
      return '-';
    }
    
    const achat = facture.articlesA[0];
    return achat && achat.id_fournisseur ? achat.id_fournisseur.nom : '-';
  };

  // Afficher un message de chargement
  if (loading && factures.length === 0) {
    return <div className="loading">Chargement des factures...</div>;
  }

  // Afficher un message d'erreur
  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="facture-table-container">
      {filteredFactures.length === 0 ? (
        <div className="no-products">Aucune facture trouvée</div>
      ) : (
        <table className="table">
          <thead>
            <tr className="tableHeader">
              <th className="headerCell">N° de facture</th>
              <th className="headerCell">Type</th>
              <th className="headerCell">Date d'ajout</th>
              <th className="headerCell">Montant total</th>
              <th className="headerCell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFactures.map((facture) => (
              <tr key={facture._id} className="tableRow">
                <td className="tableCell">{facture.N_facture}</td>
                <td className="tableCell">
                  <span className={`status ${facture.type === 'achat' ? 'inStock' : 'lowStock'}`}>
                    {facture.type === 'achat' ? 'Achat' : 'Consommation'}
                  </span>
                </td>
                <td className="tableCell">{formatDate(facture.date)}</td>
                <td className="tableCell">{facture.type === 'achat' ? `${facture.montant_total} DH` : '-'}</td>
                <td className="tableCell">
                  <div className="actionButtons">
                    <button 
                      className="actionButton" 
                      onClick={() => handleViewDetails(facture)}
                      title="Voir les détails"
                    >
                      <FaEye className="viewIcon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal de détails de facture */}
      {showDetailsModal && selectedFacture && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Détails de la facture {selectedFacture.N_facture}</h3>
              <button className="close-button" onClick={closeDetailsModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="details-info">
                <div className="details-text">
                  <p><strong>N° de facture:</strong> {selectedFacture.N_facture || selectedFacture._id}</p>
                  <p><strong>Type:</strong> {selectedFacture.type === 'achat' ? 'Achat' : 'Consommation'}</p>
                  <p><strong>Date:</strong> {formatDate(selectedFacture.date)}</p>                  
                  {selectedFacture.type === "achat" && (
                    <>
                      <p><strong>Fournisseur:</strong> {selectedFacture.id_fournisseur.nom}</p>
                      <p><strong>Montant total:</strong> {selectedFacture.montant_total} DH</p>
                    </>
                  )}
                  
                  
                </div>
                
                <div className="details-actions">
                  {/* Bouton pour importer une image */}
                  <div className="action-button-container">
                    <label htmlFor="image-upload" className="action-button">
                      <FaUpload className="button-icon" />
                      <span>Ajouter image</span>
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </div>
                  
                  {/* Bouton pour télécharger en PDF */}
                  <div className="action-button-container">
                    <button className="action-button" onClick={handleGeneratePDF}>
                      <FaFilePdf className="button-icon" />
                      <span>Télécharger PDF</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Affichage des images si elles existent */}
              {selectedImages.length > 0 && (
                <div className="facture-images-gallery">
                  <h4 className="images-title">Images de la facture ({selectedImages.length})</h4>
                  <div className="facture-images-container">
                    {selectedImages.map((imageUrl, index) => (
                      <div key={index} className="facture-image-item">
                        <div className="facture-image-header">
                          <h5>Image {index + 1}</h5>
                          <button 
                            className="delete-image-button" 
                            onClick={() => handleDeleteImage(index)}
                            title="Supprimer l'image"
                          >
                            <FaTrash />
                          </button>
                        </div>
                        <div className="facture-image-wrapper">
                          <img 
                            src={imageUrl} 
                            alt={`Facture ${selectedFacture._id} - Image ${index + 1}`} 
                            className="facture-image"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <h4>Articles</h4>
              <table className="details-table">
                <thead className="details-table-header">
                  <tr>
                    <th>Article</th>
                    <th>Quantité</th>
                    {selectedFacture.type === "achat" && (
                      <>
                        <th>Prix unitaire</th>
                        <th>Total</th>
                        <th>Date d'expiration</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {getArticles(selectedFacture).map((article, index) => (
                    <tr key={index}>
                      <td>{article.produit && article.produit.produit ? article.produit.produit : 'Article inconnu'}</td>
                      <td>{article.quantite} {article.produit ? article.produit.unite : ''}</td>
                      {selectedFacture.type === "achat" && (
                        <>
                          <td>{article.prix} DH</td>
                          <td>{article.prix * article.quantite} DH</td>
                          <td>{article.date_expiration ? formatDate(article.date_expiration) : '-'}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactureTable;
