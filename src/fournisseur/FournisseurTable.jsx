import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { fournisseurAPI } from "../services/api";
import "../style/FournisseurTable.css";
import { FaTrash } from "react-icons/fa";
import DeleteFournisseurModal from "./DeleteFournisseurModal";

const FournisseurTable = forwardRef(({ initialSearchTerm = "" }, ref) => {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("initialSearchTerm");
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Exposer les méthodes à travers la ref
  useImperativeHandle(ref, () => ({
    refreshFournisseurs,
    setSearchTerm
  }));

  // Mettre à jour searchTerm quand initialSearchTerm change
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  // Charger la liste des fournisseurs
  useEffect(() => {
    refreshFournisseurs();
  }, []);

  // Fonction pour rafraîchir la liste des fournisseurs
  const refreshFournisseurs = async () => {
    try {
      setLoading(true);
      const response = await fournisseurAPI.getAllFournisseurs();
      console.log('Réponse des fournisseurs:', response.data);
      // Vérifier si les données sont dans data.data ou directement dans data
      const fournisseursData = response.data.data || response.data;
      setFournisseurs(fournisseursData);
      setLoading(false);
    } catch (err) {
      console.error("Erreur lors du rafraîchissement des fournisseurs:", err);
      setError("Erreur lors du rafraîchissement des fournisseurs. Veuillez réessayer.");
      setLoading(false);
    }
  };

  // Ouvrir la modal de confirmation pour la suppression
  const openDeleteModal = (fournisseur) => {
    setSelectedFournisseur(fournisseur);
    setDeleteModalOpen(true);
  };

  // Gérer la suppression d'un fournisseur
  const handleDeleteFournisseur = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
      try {
        setLoading(true);
        await fournisseurAPI.deleteFournisseur(id);
        await refreshFournisseurs();
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors de la suppression du fournisseur:", err);
        setError("Erreur lors de la suppression du fournisseur. Veuillez réessayer.");
        setLoading(false);
      }
    }
  };

  // Filtrer les fournisseurs en fonction des critères de recherche
  const filteredFournisseurs = fournisseurs.filter(
    (fournisseur) =>
      (searchTerm === "" || fournisseur.nom.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Afficher un message de chargement
  if (loading && fournisseurs.length === 0) {
    return <div className="loading">Chargement des fournisseurs...</div>;
  }

  // Afficher un message d'erreur
  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="fournisseur-table-container">
      {filteredFournisseurs.length === 0 ? (
        <div className="no-fournisseurs">
          {searchTerm 
            ? <>Aucun fournisseur avec le nom <span>"{searchTerm}"</span></> 
            : "Aucun fournisseur trouvé"}
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr className="tableHeader">
              <th className="headerCell">Nom</th>
              <th className="headerCell">Email</th>
              <th className="headerCell">Téléphone</th>
              <th className="headerCell">Ville</th>
              <th className="headerCell">Code Postal</th>
              <th className="headerCell">Adresse</th>
              <th className="headerCell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFournisseurs.map((fournisseur) => (
              <tr key={fournisseur._id} className="tableRow">
                <td className="tableCell">{fournisseur.nom}</td>
                <td className="tableCell">{fournisseur.email || "-"}</td>
                <td className="tableCell">{fournisseur.telephone || "-"}</td>
                <td className="tableCell">{fournisseur.ville}</td>
                <td className="tableCell">{fournisseur.code_postal}</td>
                <td className="tableCell">{fournisseur.address || "-"}</td>
                <td className="tableCell">
                  <div className="actionButtons">
                    <button
                      className="actionButton"
                      onClick={() => openDeleteModal(fournisseur)}
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

      {/* Modal de confirmation de suppression */}
      {selectedFournisseur && (
        <DeleteFournisseurModal
          fournisseur={selectedFournisseur}
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onDelete={() => handleDeleteFournisseur(selectedFournisseur.id_fournisseur)}
        />
      )}
    </div>
  );
});

export default FournisseurTable;
