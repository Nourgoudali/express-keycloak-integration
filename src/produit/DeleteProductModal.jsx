import React from "react";
import "../style/DeleteProductModal.css";

const DeleteProductModal = ({ isOpen, onClose, productData, onDelete }) => {
  if (!isOpen) return null;

  const handleDelete = () => {
    onDelete(productData.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Confirmer la suppression</h2>

        <div className="delete-content">
          <p className="delete-message">
            Êtes-vous sûr de vouloir supprimer le produit{" "}
            <strong>{productData.product}</strong> ?
          </p>
          <p className="delete-warning">Cette action est irréversible.</p>

          <div className="delete-product-info">
            <div className="delete-detail">
              <span className="delete-label">Catégorie:</span>
              <span className="delete-value">{productData.category}</span>
            </div>
            <div className="delete-detail">
              <span className="delete-label">Quantité:</span>
              <span className="delete-value">
                {productData.quantity} {productData.unit}
              </span>
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button className="cancel-button" onClick={onClose}>
            Annuler
          </button>
          <button className="delete-button" onClick={handleDelete}>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;
