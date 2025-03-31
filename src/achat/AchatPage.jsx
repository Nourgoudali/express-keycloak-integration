import React from 'react';
import AchatForm from './AchatForm';
import AchatListHeader from './AchatListHeader';

const AchatPage = () => {
  return (
    <div className="page-wrapper">
      <AchatListHeader />
      
      <div className="page-content">
        <AchatForm />
      </div>
    </div>
  );
};

export default AchatPage; 