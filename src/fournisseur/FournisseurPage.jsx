import React, { useState, useRef } from "react";
import "../style/FournisseurPage.css";
import Header from "./FornisseurListHeader";
import SearchBar from "./FournisseurListControls";
import SupplierTable from "./FournisseurTable";

const FournisseurPage = () => {
  const tableRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleAddFournisseur = (newFournisseur) => {
    // Rafraîchir la table quand un nouveau fournisseur est ajouté
    if (tableRef.current && tableRef.current.refreshFournisseurs) {
      tableRef.current.refreshFournisseurs();
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    // Si nous avons accès à la table via la ref, nous pouvons également mettre à jour son état de recherche
    if (tableRef.current && tableRef.current.setSearchTerm) {
      tableRef.current.setSearchTerm(term);
    }
  };

  return (
    <>
      <Header />
      <div className="supplier-container">
        <SearchBar 
          onAddFournisseur={handleAddFournisseur} 
          onSearch={handleSearch} 
        />
        <SupplierTable ref={tableRef} initialSearchTerm={searchTerm} />
      </div>
    </>
  );
};

export default FournisseurPage;
