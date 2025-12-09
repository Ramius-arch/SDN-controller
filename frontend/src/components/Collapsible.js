import React, { useState } from 'react';

const Collapsible = ({ children, title, isOpen, toggle }) => {
  return (
    <div className="collapsible">
      <button onClick={toggle} className="collapsible-header">
        {title} {isOpen ? 'Collapse' : 'Expand'}
      </button>
      {isOpen && <div className="collapsible-content">{children}</div>}
    </div>
  );
};

export default Collapsible;