import React from 'react';
import '../styles/DashboardPage.css';
import blobLeft from '../assets/blobLeft.svg';
import blobRight from '../assets/blobRight.svg';
import Sidebar from '../components/Sidebar';

function DashboardPage() {
  return (
    <div className="dashboard-container">
      <Sidebar activePage="dashboard" />
      <main className="main-panel">
        <img src={blobLeft} alt="Decoration Left" className="blob blob-left" />
        <img src={blobRight} alt="Decoration Right" className="blob blob-right" />
        <div className="content-container">
          <h1>This is the dashboard page.</h1>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;