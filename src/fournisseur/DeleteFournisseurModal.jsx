import React from "react";
import "../style/DeleteFournisseurModal.css";

const DeleteFournisseurModal = ({ fournisseur, isOpen, onClose, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Confirmer la suppression</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <p>
            Êtes-vous sûr de vouloir supprimer le fournisseur{" "}
            <strong>{fournisseur.nom}</strong> ?
          </p>
          <p className="warning-text">
            Cette action ne peut pas être annulée. Toutes les données associées à ce fournisseur seront définitivement supprimées.
          </p>
          
          <div className="delete-fournisseur-info">
            <div className="info-row">
              <span className="info-label">Nom:</span>
              <span className="info-value">{fournisseur.nom}</span>
            </div>
            {fournisseur.email && (
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{fournisseur.email}</span>
              </div>
            )}
            {fournisseur.telephone && (
              <div className="info-row">
                <span className="info-label">Téléphone:</span>
                <span className="info-value">{fournisseur.telephone}</span>
              </div>
            )}
            <div className="info-row">
              <span className="info-label">Ville:</span>
              <span className="info-value">{fournisseur.ville}</span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Annuler
          </button>
          <button className="delete-button" onClick={onDelete}>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteFournisseurModal; 