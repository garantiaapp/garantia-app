import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-content">
          <p>&copy; {currentYear} Etherna Joias - Sistema de Gestão de Garantia</p>
          <p>Todos os direitos reservados</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
