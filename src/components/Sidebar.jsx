// Sidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ummaLogo from '../assets/umma-logo.svg';

function Sidebar({ activePage }) {
  const navigate = useNavigate();
  
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <aside className="sidebar">
      <div className="top-section">
        <div className="logo-section">
          <img src={ummaLogo} alt="UMMA NA Logo" className="logo-icon" />
          <span className="logo-text">umma na</span>
        </div>
        <nav className="nav-section">
          <ul>
            <li 
              className={activePage === 'dashboard' ? 'active' : ''} 
              onClick={() => handleNavigation('/dashboard')}
            >
              Dashboard
            </li>
            <li 
              className={activePage === 'communities' ? 'active' : ''} 
              onClick={() => handleNavigation('/communities')}
            >
              Communities
            </li>
            <li 
              className={activePage === 'chips' ? 'active' : ''} 
              onClick={() => handleNavigation('/chips')}
            >
              CHIPS Agents
            </li>
            <li 
              className={activePage === 'drivers' ? 'active' : ''} 
              onClick={() => handleNavigation('/drivers')}
            >
              ETS Drivers
            </li>
            <li 
              className={activePage === 'facilities' ? 'active' : ''} 
              onClick={() => handleNavigation('/facilities')}
            >
              Facilities
            </li>
            <li 
              className={activePage === 'rides' ? 'active' : ''} 
              onClick={() => handleNavigation('/rides')}
            >
              Rides
            </li>
            <li 
              className={activePage === 'analytics' ? 'active' : ''} 
              onClick={() => handleNavigation('/analytics')}
            >
              Analytics
            </li>
          </ul>
        </nav>
      </div>
      <div style={{ flex: '1 1 0' }}></div>
      <div className="bottom-links">
        <ul>
          <li>My Account</li>
          <li>Sign Out</li>
          <li>Help</li>
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;