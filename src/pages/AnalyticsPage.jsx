import React from 'react';
import '../styles/DashboardPage.css';
import Sidebar from '../components/Sidebar';

function AnalyticsPage() {
  return (
    <div className="dashboard-container">
      <Sidebar activePage="analytics" />
      <main className="main-panel">
        <div className="content-container">
          <h1>This is the Analytics page.</h1>
        </div>
      </main>
    </div>
  );
}

export default AnalyticsPage;