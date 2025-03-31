import React from "react";
import ConsommationForm from "./ConsommationForm";
import ConsommationListHeader from "./ConsommationListHeader";
import "../style/ConsommationPage.css";

const ConsommationPage = () => {
  return (
    <><ConsommationListHeader />
    <div className="page-wrapper">
      <ConsommationForm />
    </div>
    </>
  );
};

export default ConsommationPage;
