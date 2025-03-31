import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import "../style/FactureListControls.css";
import { anneeScolaireAPI } from "../services/api";  

const FactureListControls = ({ onFilterChange, onYearChange }) => {
  const [selectedFilter, setSelectedFilter] = useState("tous");
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [schoolYears, setSchoolYears] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les années scolaires au chargement du composant
  useEffect(() => {
    fetchSchoolYears();
  }, []);

  // Fonction pour récupérer les années scolaires depuis l'API
  const fetchSchoolYears = async () => {
    try {
      setLoading(true);
      const response = await anneeScolaireAPI.getAllYears();
      
      if (response.data && response.data.success) {
        const years = response.data.years.map(year => year.annee);
        setSchoolYears(years);
        
        // Définir l'année active comme année sélectionnée par défaut
        if (response.data.activeYear) {
          const activeYear = response.data.activeYear.annee;
          setSelectedYear(activeYear);
          // Informer le parent du changement d'année
          if (onYearChange) onYearChange(activeYear);
        } else if (years.length > 0) {
          setSelectedYear(years[0]);
          // Informer le parent du changement d'année
          if (onYearChange) onYearChange(years[0]);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des années scolaires:", error);
      setLoading(false);
    }
  };

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    onFilterChange(filter);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
    setShowYearDropdown(false);
    // Informer le parent du changement d'année
    if (onYearChange) onYearChange(year);
  };

  return (
    <div className="filter-container">
      <div className="filter-content">
        <div className="filter-options">
          <label className={`filter-option ${selectedFilter === "tous" ? "selected" : ""}`}>
            <input
              type="checkbox"
              checked={selectedFilter === "tous"}
              onChange={() => handleFilterChange("tous")}
              className="filter-checkbox"
            />
            <span className="filter-label">Tous</span>
          </label>
          
          <label className={`filter-option ${selectedFilter === "achat" ? "selected" : ""}`}>
            <input
              type="checkbox"
              checked={selectedFilter === "achat"}
              onChange={() => handleFilterChange("achat")}
              className="filter-checkbox"
            />
            <span className="filter-label">Achat</span>
          </label>
          
          <label className={`filter-option ${selectedFilter === "consommation" ? "selected" : ""}`}>
            <input
              type="checkbox"
              checked={selectedFilter === "consommation"}
              onChange={() => handleFilterChange("consommation")}
              className="filter-checkbox"
            />
            <span className="filter-label">Consommation</span>
          </label>
        </div>

        <div className="year-dropdown-container">
          <button 
            className="year-dropdown-button"
            onClick={() => setShowYearDropdown(!showYearDropdown)}
            disabled={loading || schoolYears.length === 0}
          >
            <FaCalendarAlt className="calendar-icon" />
            <span>{loading ? "Chargement..." : selectedYear || "Sélectionner une année"}</span>
            <FaChevronDown className="chevron-icon" />
          </button>
          
          {showYearDropdown && (
            <div className="year-dropdown-menu">
              {schoolYears.map((year) => (
                <div 
                  key={year}
                  className={`year-option ${selectedYear === year ? "selected" : ""}`}
                  onClick={() => handleYearChange(year)}
                >
                  {year}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FactureListControls;
