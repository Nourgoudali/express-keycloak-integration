import React, { useState } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import "../style/FournisseurListControls.css";
import AddFournisseurModal from "./AddFournisseurModal";

function SearchBar({ onAddFournisseur, onSearch }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddFournisseur = (newFournisseur) => {
    console.log("Nouveau fournisseur ajouté:", newFournisseur);
    
    // Propager l'événement au parent
    if (onAddFournisseur) {
      onAddFournisseur(newFournisseur);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    
    // Propager la recherche au composant parent
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Propager la recherche au composant parent
    if (onSearch) {
      onSearch(searchText);
    }
  };

  return (
    <>
      <div className="searchContainer">
        <div className="search-wrapper">
          <input
            type="text"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Rechercher..."
            className="search-input"
          />
          <FaSearch className="search-icon" size={20} />
        </div>
        <button className="add-button" onClick={openModal}>
          <FaPlus size={15} color="white" />
          <span className="button-text">Ajouter un Fournisseur</span>
        </button>
      </div>

      <AddFournisseurModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onAddFournisseur={handleAddFournisseur}
      />
    </>
  );
}

export default SearchBar;
