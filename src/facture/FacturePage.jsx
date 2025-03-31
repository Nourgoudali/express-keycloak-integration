import React, { useState } from 'react';
import FactureHeader from './FactureHeader';
import FactureListControls from './FactureListControls';
import FactureTable from './FactureTable';
import '../style/FacturePage.css';

const FacturePage = () => {
  const [currentFilter, setCurrentFilter] = useState('tous');
  const [selectedYear, setSelectedYear] = useState(null);

  const handleFilterChange = (filter) => {
    setCurrentFilter(filter);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  return (
    <div className="facture-page">
      <FactureHeader />
      <div className="facture-content">
        <FactureListControls 
          onFilterChange={handleFilterChange} 
          onYearChange={handleYearChange}
        />
        <FactureTable 
          filter={currentFilter} 
          selectedYear={selectedYear}
        />
      </div>
    </div>
  );
};

export default FacturePage;
