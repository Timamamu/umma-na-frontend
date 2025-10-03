// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CommunitiesPage from './pages/CommunitiesPage'; // Rename from CatchmentAreasPage
import ChipsAgentsPage from './pages/ChipsAgentsPage';
import ETSDriversPage from './pages/ETSDriversPage';
import FacilitiesPage from './pages/FacilitiesPage';
import RidesPage from './pages/RidesPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="/chips" element={<ChipsAgentsPage />} />
        <Route path="/drivers" element={<ETSDriversPage />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/rides" element={<RidesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </Router>
  );
}

export default App;