import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ user, logout }) => {
  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/dashboard">
            <h1>Etherna Joias</h1>
          </Link>
        </div>
        <div className="user-info">
          <span>Olá, {user.name}</span>
          <div className="dropdown">
            <button className="dropdown-toggle">
              <i className="fas fa-user-circle"></i>
            </button>
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item">
                <i className="fas fa-user"></i> Perfil
              </Link>
              <button onClick={logout} className="dropdown-item">
                <i className="fas fa-sign-out-alt"></i> Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
