import React, { useState } from "react";
import { articleAPI } from "../services/api";
import ViewProductModal from "./ViewProductModal";
import EditProductModal from "./EditProductModal";
import DeleteProductModal from "./DeleteProductModal";
import "../style/ProductTable.css";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const ProductTable = ({ products = [], loading = false, error = null, onProductUpdated }) => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Gérer la modification d'un article
  const handleUpdateProduct = async (updatedProduct) => {
    try {
      await articleAPI.updateArticle(updatedProduct._id, updatedProduct);
      if (onProductUpdated) onProductUpdated();
      setEditModalOpen(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'article:", err);
    }
  };

  // Gérer la suppression d'un article
  const handleDeleteProduct = async (id) => {
    try {
      await articleAPI.deleteArticle(id);
      if (onProductUpdated) onProductUpdated();
      setDeleteModalOpen(false);
    } catch (err) {
      console.error("Erreur lors de la suppression de l'article:", err);
    }
  };

  // Fonction pour déterminer la classe CSS du statut
  const getStatusClass = (statut) => {
    return statut === "En stock" ? "inStock" : "lowStock";
  };

  // Afficher un message de chargement
  if (loading) {
    return <div className="loading">Chargement des produits...</div>;
  }

  // Afficher un message d'erreur
  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="product-table-container">
      {products.length === 0 ? (
        <div className="no-products">Aucun produit trouvé</div>
      ) : (
        <table className="table">
          <thead>
            <tr className="tableHeader">
              <th className="headerCell">Catégorie</th>
              <th className="headerCell">Produit</th>
              <th className="headerCell">Quantité</th>
              <th className="headerCell">Unité</th>
              <th className="headerCell">Min-Max</th>
              <th className="headerCell">Statut</th>
              <th className="headerCell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="tableRow">
                <td className="tableCell">{product.categorie}</td>
                <td className="tableCell">{product.produit}</td>
                <td className="tableCell">{product.quantite}</td>
                <td className="tableCell">{product.unite}</td>
                <td className="tableCell">{`${product.minStock}-${product.maxStock}`}</td>
                <td className="tableCell">
                  <span className={`status ${getStatusClass(product.statut)}`}>
                    {product.statut}
                  </span>
                </td>
                <td className="tableCell">
                  <div className="actionButtons">
                    <button
                      className="actionButton"
                      onClick={() => {
                        setSelectedProduct(product);
                        setViewModalOpen(true);
                      }}
                    >
                      <FaEye className="viewIcon" />
                    </button>
                    <button
                      className="actionButton"
                      onClick={() => {
                        setSelectedProduct(product);
                        setEditModalOpen(true);
                      }}
                    >
                      <FaEdit className="editIcon" />
                    </button>
                    <button
                      className="actionButton"
                      onClick={() => {
                        setSelectedProduct(product);
                        setDeleteModalOpen(true);
                      }}
                    >
                      <FaTrash className="deleteIcon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedProduct && viewModalOpen && (
        <ViewProductModal
          product={selectedProduct}
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
        />
      )}

      {selectedProduct && editModalOpen && (
        <EditProductModal
          product={selectedProduct}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onUpdate={handleUpdateProduct}
        />
      )}

      {selectedProduct && deleteModalOpen && (
        <DeleteProductModal
          product={selectedProduct}
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onDelete={() => handleDeleteProduct(selectedProduct._id)}
        />
      )}
    </div>
  );
};

export default ProductTable;
