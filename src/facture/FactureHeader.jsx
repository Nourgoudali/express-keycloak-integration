import React from "react";
import { FaBell } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import "../style/FactureHeader.css";

const FactureHeader = () => {
  return (
    <header className="header">
      <h1 className="title">Listes des Factures</h1>
      <div className="iconContainer">
        <button className="iconButton" aria-label="Notifications">
          <FaBell className="bellIcon" />
        </button>
        <button className="adminButton" aria-label="Admin">
          <div className="adminBadge">
            <FaUser className="userIcon" />
            <span className="adminText">Admin</span>
          </div>
        </button>
      </div>
    </header>
  );
};

export default FactureHeader;
