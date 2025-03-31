import React, { useState, useEffect } from "react";
import "../style/ProductPage.css";
import ProductListHeader from "./ProductListHeader";
import ProductListControls from "./ProductListControls";
import ProductTable from "./ProductTable";
import { articleAPI } from "../services/api";
import * as XLSX from 'xlsx';

const ProductPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Charger les produits au chargement du composant
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await articleAPI.getAllArticles();
        setProducts(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des produits:", err);
        setError("Erreur lors du chargement des produits. Veuillez réessayer.");
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Récupérer les catégories uniques des produits
  const categories = [...new Set(products.map(product => product.categorie))];
  
  // Filtrer les produits en fonction de la recherche, des catégories sélectionnées et des statuts
  const filteredProducts = products.filter(product => {
    // Filtrer par le terme de recherche
    const matchesSearch = searchTerm === "" || 
                        product.produit.toLowerCase().startsWith(searchTerm.toLowerCase());
    
    // Filtrer par catégories sélectionnées
    const matchesCategory = selectedCategories.length === 0 || 
                          selectedCategories.includes(product.categorie);
    
    // Filtrer par statuts sélectionnés
    const matchesStatus = selectedStatuses.length === 0 || 
                        selectedStatuses.includes(product.statut);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  // Gérer la recherche
  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };
  
  // Gérer les filtres de catégorie
  const handleCategoriesChange = (categories) => {
    setSelectedCategories(categories);
  };
  
  // Gérer les filtres de statut
  const handleStatusChange = (statuses) => {
    setSelectedStatuses(statuses);
  };
  
  // Exporter les produits au format Excel
  const handleExportExcel = () => {
    // Préparer les données pour l'export
    const data = filteredProducts.map(product => ({
      Catégorie: product.categorie,
      Produit: product.produit,
      Quantité: product.quantite,
      Unité: product.unite,
      'Stock Min': product.minStock,
      'Stock Max': product.maxStock,
      Statut: product.statut
    }));
    
    // Créer un nouveau classeur Excel
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produits");
    
    // Générer le fichier Excel
    XLSX.writeFile(wb, "produits_export.xlsx");
  };
  
  // Rafraîchir la liste des produits après un ajout ou une modification
  const refreshProducts = async () => {
    try {
      setLoading(true);
      const response = await articleAPI.getAllArticles();
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du rafraîchissement des produits:", err);
      setError("Erreur lors du rafraîchissement des produits. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <>
      <ProductListHeader />
      <main className="container">
        <ProductListControls 
          onSearchChange={handleSearchChange}
          onCategoriesChange={handleCategoriesChange}
          onStatusChange={handleStatusChange}
          categories={categories}
          onExportExcel={handleExportExcel}
        />
        <ProductTable 
          products={filteredProducts}
          loading={loading}
          error={error}
          onProductUpdated={refreshProducts}
        />
      </main>
    </>
  );
};

export default ProductPage;
