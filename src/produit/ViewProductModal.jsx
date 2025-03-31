import React from "react";
import "../style/ViewProductModal.css";

const ViewProductModal = ({ isOpen, onClose, product }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Détails du produit</h2>

        <div className="product-details">
          <div className="detail-group">
            <span className="detail-label">Catégorie:</span>
            <span className="detail-value">{product.categorie}</span>
          </div>

          <div className="detail-group">
            <span className="detail-label">Produit:</span>
            <span className="detail-value">{product.produit}</span>
          </div>

          <div className="detail-group">
            <span className="detail-label">Quantité:</span>
            <span className="detail-value">
              {product.quantite} {product.unite}
            </span>
          </div>

          <div className="detail-group">
            <span className="detail-label">Unité:</span>
            <span className="detail-value">{product.unite}</span>
          </div>

          <div className="detail-group">
            <span className="detail-label">Stock Min-Max:</span>
            <span className="detail-value">{`${product.minStock}-${product.maxStock}`}</span>
          </div>

          <div className="detail-group">
            <span className="detail-label">Statut:</span>
            <span
              className={`status-badge ${
                product.statut === "En stock" ? "status-in-stock" : "status-low-stock"
              }`}
            >
              {product.statut}
            </span>
          </div>
        </div>

        <button className="close-button" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  );
};

export default ViewProductModal;
