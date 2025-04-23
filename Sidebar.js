import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ user }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          <li className={isActive('/dashboard') ? 'active' : ''}>
            <Link to="/dashboard">
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className={isActive('/clients') ? 'active' : ''}>
            <Link to="/clients">
              <i className="fas fa-users"></i>
              <span>Clientes</span>
            </Link>
          </li>
          <li className={isActive('/products') ? 'active' : ''}>
            <Link to="/products">
              <i className="fas fa-gem"></i>
              <span>Produtos</span>
            </Link>
          </li>
          <li className={isActive('/warranties') ? 'active' : ''}>
            <Link to="/warranties">
              <i className="fas fa-shield-alt"></i>
              <span>Garantias</span>
            </Link>
          </li>
          {user && user.role === 'admin' && (
            <li className={isActive('/reports') ? 'active' : ''}>
              <Link to="/reports">
                <i className="fas fa-chart-bar"></i>
                <span>Relatórios</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
