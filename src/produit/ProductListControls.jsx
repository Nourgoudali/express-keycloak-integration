import React, { useState, useEffect } from "react";
import "../style/ProductListControls.css";
import { FaSearch, FaFilter, FaPlus, FaFileExcel } from "react-icons/fa";
import AddProductModal from "./AddProductModal";
import { articleAPI } from "../services/api";

const ProductListControls = ({ onSearchChange, onCategoriesChange, onStatusChange, categories = [], onExportExcel}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  
  // Statuts disponibles
  const statuses = ["En stock", "Faible stock"];

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    // Transmettre la valeur au composant parent
    onSearchChange(value);
  };

  const handleCategoryChange = (category) => {
    let newSelectedCategories;
    if (selectedCategories.includes(category)) {
      // Désélectionner la catégorie
      newSelectedCategories = selectedCategories.filter(cat => cat !== category);
    } else {
      // Sélectionner la catégorie
      newSelectedCategories = [...selectedCategories, category];
    }
    setSelectedCategories(newSelectedCategories);
    // Transmettre au composant parent
    onCategoriesChange(newSelectedCategories);
  };
  
  const handleStatusChange = (status) => {
    let newSelectedStatuses;
    if (selectedStatuses.includes(status)) {
      // Désélectionner le statut
      newSelectedStatuses = selectedStatuses.filter(s => s !== status);
    } else {
      // Sélectionner le statut
      newSelectedStatuses = [...selectedStatuses, status];
    }
    setSelectedStatuses(newSelectedStatuses);
    // Transmettre au composant parent
    onStatusChange(newSelectedStatuses);
  };

  const handleModalSuccess = () => {
    handleCloseModal();
    // Vous pouvez ajouter ici une fonction pour rafraîchir la liste des produits
  };
  
  // Fermer le menu de filtre lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterOpen && !event.target.closest('.filterSection')) {
        setIsFilterOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFilterOpen]);

  return (
    <section className="controlsContainer">
      <div className="searchContainer">
        <FaSearch className="searchIcon" />
        <input
          type="text"
          placeholder="Rechercher..."
          className="searchInput"
          value={searchInput}
          onChange={handleSearchInputChange}
          aria-label="Search products"
        />
      </div>

      <div className="filterSection">
        <button className="filterButton" onClick={handleOpenFilter}>
          <FaFilter className="filterIcon" />
          <span className="filterText">Filtrer</span>
        </button>

        {isFilterOpen && (
          <div className="filterDropdown">
            <div className="filterHeader">Filtrer par catégorie</div>
            <div className="categoriesList">
              {categories.map((category, index) => (
                <div key={index} className="categoryCheckbox">
                  <input
                    type="checkbox"
                    id={`category-${index}`}
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryChange(category)}
                  />
                  <label htmlFor={`category-${index}`}>{category}</label>
                </div>
              ))}
            </div>
            
            <div className="filterHeader">Filtrer par statut</div>
            <div className="statusesList">
              {statuses.map((status, index) => (
                <div key={`status-${index}`} className="categoryCheckbox">
                  <input
                    type="checkbox"
                    id={`status-${index}`}
                    checked={selectedStatuses.includes(status)}
                    onChange={() => handleStatusChange(status)}
                  />
                  <label htmlFor={`status-${index}`}>{status}</label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="actionButtons">
        <button className="addButton" onClick={handleOpenModal}>
          <FaPlus className="plusIcon" />
          <span>Ajouter un Produit</span>
        </button>

        <button className="exportButton" onClick={onExportExcel}>
          <FaFileExcel className="exportIcon" />
          <span>Exporter en Excel</span>
        </button>
      </div>

      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onAddSuccess={handleModalSuccess} 
      />
    </section>
  );
};

export default ProductListControls;
