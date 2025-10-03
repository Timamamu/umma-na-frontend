import React from 'react';
import '../styles/DashboardPage.css';
import Sidebar from '../components/Sidebar';

function RidesPage() {
  return (
    <div className="dashboard-container">
      <Sidebar activePage="rides" />
      <main className="main-panel">
        <div className="content-container">
          <h1>This is the Rides page.</h1>
        </div>
      </main>
    </div>
  );
}

export default RidesPage;