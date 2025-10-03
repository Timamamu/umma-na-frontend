// FacilitiesPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, PlusCircle, MapPin, Edit2, Trash2, CheckSquare, X, Filter, List, MapIcon } from 'lucide-react';
import axios from 'axios';
import '../styles/DashboardPage.css';
import '../styles/FacilitiesPage.css';
import Sidebar from '../components/Sidebar';

//const API_BASE_URL = 'http://localhost:3001';
const API_BASE_URL = "https://umma-na-backend.onrender.com";


// Get a summary of key capabilities for display in the table
const getCapabilitySummary = (capabilities) => {
  if (!capabilities) return 'None';
  
  const keyCapabilities = [];
  if (capabilities.has_doctor) keyCapabilities.push('Doctor');
  if (capabilities.has_theater) keyCapabilities.push('Theater');
  if (capabilities.has_blood) keyCapabilities.push('Blood');
  if (capabilities.staff_24_7) keyCapabilities.push('24/7 Staff');
  
  if (keyCapabilities.length === 0) return 'Basic';
  return keyCapabilities.join(', ');
};

// Facility type options
const FACILITY_TYPES = [
'Primary Health Center',
'Basic Health Center',
'Comprehensive Health Center',
'General Hospital',
'Teaching Hospital',
'Private Clinic',
'Other'
];

// Capabilities with human-readable labels
const CAPABILITIES = [
{ id: 'has_uterotonics', label: 'Uterotonics (oxytocin, misoprostol)' },
{ id: 'has_blood', label: 'Blood products/transfusion' },
{ id: 'has_anticonvulsants', label: 'Anticonvulsants (MgSO4, diazepam)' },
{ id: 'has_antihypertensives', label: 'Antihypertensives' },
{ id: 'has_adrenaline', label: 'Adrenaline' },
{ id: 'has_delivery_room', label: 'Delivery room' },
{ id: 'has_incubator', label: 'Incubator/newborn care' },
{ id: 'has_power', label: 'Reliable power supply' },
{ id: 'has_water', label: 'Clean water' },
{ id: 'has_mva_kit', label: 'MVA kit for miscarriage management' },
{ id: 'has_antibiotics', label: 'Antibiotics' },
{ id: 'has_iv_fluids', label: 'IV fluids' },
{ id: 'has_theater', label: 'Operating theater' },
{ id: 'has_ultrasound', label: 'Ultrasound' },
{ id: 'has_doctor', label: 'Doctor on premises' },
{ id: 'has_midwife_or_nurse', label: 'Midwife/Nurse on premises' },
{ id: 'has_referral_transport', label: 'Referral transport' },
{ id: 'has_monitoring', label: 'Vital signs monitoring' },
{ id: 'staff_24_7', label: '24/7 staffing' },
];

// Group capabilities by category for better organization
const CAPABILITY_GROUPS = [
{
  title: 'Medications & Supplies',
  items: ['has_uterotonics', 'has_blood', 'has_anticonvulsants', 'has_antihypertensives', 
          'has_adrenaline', 'has_antibiotics', 'has_iv_fluids', 'has_mva_kit']
},
{
  title: 'Facilities & Equipment',
  items: ['has_delivery_room', 'has_incubator', 'has_theater', 'has_ultrasound', 'has_monitoring']
},
{
  title: 'Infrastructure',
  items: ['has_power', 'has_water', 'has_referral_transport']
},
{
  title: 'Staffing',
  items: ['has_doctor', 'has_midwife_or_nurse', 'staff_24_7']
}
];

function FacilitiesPage() {
const [showAddModal, setShowAddModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [searchTerm, setSearchTerm] = useState('');
const [viewMode, setViewMode] = useState('list');
const [showFilters, setShowFilters] = useState(false);
const [filters, setFilters] = useState({
  lga: '',
  ward: '',
  facilityType: '',
  capabilities: []
});
const [facilities, setFacilities] = useState([]);
const [loading, setLoading] = useState(true);
const [expandedFacilityId, setExpandedFacilityId] = useState(null);
const [error, setError] = useState(null);
const [showErrorModal, setShowErrorModal] = useState(false);
const [selectedFacility, setSelectedFacility] = useState(null);
const [selectedCapabilities, setSelectedCapabilities] = useState({});
const [activeCapabilityTab, setActiveCapabilityTab] = useState(0);

// Form state
const [formData, setFormData] = useState({
  name: '',
  ward: '',
  lga: '',
  lat: '',
  lng: '',
  facilityType: FACILITY_TYPES[0],
});

// Fetch facilities on component mount
useEffect(() => {
  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/hospitals`);
      setFacilities(response.data);
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError('Failed to load facilities. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  fetchFacilities();
}, []);

const handleAddFacility = () => {
  // Reset form data
  setFormData({
    name: '',
    ward: '',
    lga: '',
    lat: '',
    lng: '',
    facilityType: FACILITY_TYPES[0],
  });
  
  // Reset all capabilities to false
  const initialCapabilities = {};
  CAPABILITIES.forEach(cap => {
    initialCapabilities[cap.id] = false;
  });
  setSelectedCapabilities(initialCapabilities);
  
  // Reset active tab
  setActiveCapabilityTab(0);
  
  // Show modal
  setShowAddModal(true);
};

const handleEditFacility = (facility) => {
  // Set selected facility for reference
  setSelectedFacility(facility);
  
  // Populate form with facility data
  setFormData({
    name: facility.name,
    ward: facility.ward,
    lga: facility.lga,
    lat: facility.lat.toString(),
    lng: facility.lng.toString(),
    facilityType: facility.facilityType,
  });
  
  // Set capabilities based on facility data
  const capabilities = {};
  CAPABILITIES.forEach(cap => {
    capabilities[cap.id] = facility.capabilities ? !!facility.capabilities[cap.id] : false;
  });
  setSelectedCapabilities(capabilities);
  
  // Reset active tab
  setActiveCapabilityTab(0);
  
  // Show edit modal
  setShowEditModal(true);
};

const handleDeleteFacility = (facility) => {
  setSelectedFacility(facility);
  setShowDeleteModal(true);
};

const handleSearch = (e) => {
  setSearchTerm(e.target.value);
};

const toggleFilters = () => {
  setShowFilters(!showFilters);
};

const handleFilterChange = (e) => {
  const { name, value } = e.target;
  setFilters({
    ...filters,
    [name]: value
  });
};

const handleCapabilityFilterChange = (capabilityId) => {
  setFilters(prevFilters => {
    const updatedCapabilities = [...prevFilters.capabilities];
    
    // If already selected, remove it; otherwise, add it
    const index = updatedCapabilities.indexOf(capabilityId);
    if (index > -1) {
      updatedCapabilities.splice(index, 1);
    } else {
      updatedCapabilities.push(capabilityId);
    }
    
    return {
      ...prevFilters,
      capabilities: updatedCapabilities
    };
  });
};

const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData({
    ...formData,
    [name]: value
  });
};

const handleCapabilityChange = (capabilityId) => {
  setSelectedCapabilities({
    ...selectedCapabilities,
    [capabilityId]: !selectedCapabilities[capabilityId]
  });
};

const validateForm = () => {
  // Clear previous errors
  setError(null);
  setShowErrorModal(false);
  
  // Simple validation for required fields
  if (!formData.name || !formData.ward || !formData.lga || !formData.facilityType) {
    setError('Name, Ward, LGA, and Facility Type are required.');
    setShowErrorModal(true);
    return false;
  }
  
  // Validate latitude and longitude
  const lat = parseFloat(formData.lat);
  const lng = parseFloat(formData.lng);
  
  if (isNaN(lat) || isNaN(lng)) {
    setError('Latitude and Longitude must be valid numbers.');
    setShowErrorModal(true);
    return false;
  }
  
  if (lat < -90 || lat > 90) {
    setError('Latitude must be between -90 and 90 degrees.');
    setShowErrorModal(true);
    return false;
  }
  
  if (lng < -180 || lng > 180) {
    setError('Longitude must be between -180 and 180 degrees.');
    setShowErrorModal(true);
    return false;
  }
  
  return true;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  try {
    // Prepare data for API
    const facilityData = {
      name: formData.name,
      ward: formData.ward,
      lga: formData.lga,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      facilityType: formData.facilityType,
      ...selectedCapabilities // Add all capability flags
    };
    
    const response = await axios.post(`${API_BASE_URL}/register-hospital`, facilityData);
    
    if (response.status === 200) {
      // Add the new facility to our local state with the ID from the response
      const newFacility = {
        id: response.data.id,
        name: formData.name,
        ward: formData.ward,
        lga: formData.lga,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
        facilityType: formData.facilityType,
        capabilities: { ...selectedCapabilities },
        createdAt: new Date()
      };
      
      setFacilities([...facilities, newFacility]);
      setShowAddModal(false);
      alert('Facility registered successfully!');
    }
  } catch (err) {
    console.error('Error registering facility:', err);
    if (err.response && err.response.data) {
      setError(err.response.data);
    } else {
      setError('Failed to register facility. Please try again.');
    }
    setShowErrorModal(true);
  }
};

const handleUpdate = async (e) => {
  e.preventDefault();
  
  if (!validateForm() || !selectedFacility) return;
  
  try {
    // Prepare update data with capabilities in the proper structure
    const updateData = {
      name: formData.name,
      ward: formData.ward,
      lga: formData.lga,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      facilityType: formData.facilityType,
      capabilities: { ...selectedCapabilities }
    };
    
    const response = await axios.patch(`${API_BASE_URL}/update-hospital/${selectedFacility.id}`, updateData);
    
    if (response.status === 200) {
      // Update the facility in our local state
      const updatedFacilities = facilities.map(facility => {
        if (facility.id === selectedFacility.id) {
          return {
            ...facility,
            name: formData.name,
            ward: formData.ward,
            lga: formData.lga,
            lat: parseFloat(formData.lat),
            lng: parseFloat(formData.lng),
            facilityType: formData.facilityType,
            capabilities: { ...selectedCapabilities }
          };
        }
        return facility;
      });
      
      setFacilities(updatedFacilities);
      setShowEditModal(false);
      setSelectedFacility(null);
      alert('Facility updated successfully!');
    }
  } catch (err) {
    console.error('Error updating facility:', err);
    if (err.response && err.response.data) {
      setError(err.response.data);
    } else {
      setError('Failed to update facility. Please try again.');
    }
    setShowErrorModal(true);
  }
};

const handleDelete = async () => {
  if (!selectedFacility) return;
  
  try {
    
    const response = await axios.delete(`${API_BASE_URL}/hospitals/${selectedFacility.id}`);
    
    if (response.status === 200) {
      // Remove the facility from our local state
      const updatedFacilities = facilities.filter(f => f.id !== selectedFacility.id);
      setFacilities(updatedFacilities);
      setShowDeleteModal(false);
      setSelectedFacility(null);
      alert('Facility deleted successfully!');
    }
  } catch (err) {
    console.error('Error deleting facility:', err);
    if (err.response && err.response.data) {
      setError(err.response.data);
    } else {
      setError('Failed to delete facility. Please try again.');
    }
    setShowErrorModal(true);
  }
};

// Filter facilities based on search term and filters
const filteredFacilities = facilities.filter(facility => {
  // Search term filter
  const matchesSearch = 
    facility.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.ward?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.lga?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facility.facilityType?.toLowerCase().includes(searchTerm.toLowerCase());
  
  if (!matchesSearch) return false;
  
  // Apply additional filters
  if (filters.lga && facility.lga?.toLowerCase() !== filters.lga.toLowerCase()) {
    return false;
  }
  
  if (filters.ward && facility.ward?.toLowerCase() !== filters.ward.toLowerCase()) {
    return false;
  }
  
  if (filters.facilityType && facility.facilityType?.toLowerCase() !== filters.facilityType.toLowerCase()) {
    return false;
  }
  
  // Filter by capabilities - facility must have ALL selected capabilities
  if (filters.capabilities.length > 0) {
    const facilityCapabilities = facility.capabilities || {};
    
    // Check if facility has all selected capabilities
    const hasAllCapabilities = filters.capabilities.every(capId => 
      facilityCapabilities[capId] === true
    );
    
    if (!hasAllCapabilities) return false;
  }
  
  return true;
});

// Extract unique wards, LGAs, and facility types for filtering
const uniqueWards = [...new Set(facilities.map(facility => facility.ward))].filter(Boolean).sort();
const uniqueLGAs = [...new Set(facilities.map(facility => facility.lga))].filter(Boolean).sort();
const uniqueTypes = [...new Set(facilities.map(facility => facility.facilityType))].filter(Boolean).sort();

// Function to handle toggling the expanded capabilities view
const toggleExpandedCapabilities = (id) => {
  setExpandedFacilityId(expandedFacilityId === id ? null : id);
};

// Count capabilities that a facility has
const countCapabilities = (capabilities) => {
  if (!capabilities) return 0;
  return Object.entries(capabilities).filter(([key, value]) => value === true).length;
};

// Get a list of all capabilities that a facility has
const getFacilityCapabilities = (capabilities) => {
  if (!capabilities) return [];
  
  return CAPABILITIES
    .filter(cap => capabilities[cap.id] === true)
    .map(cap => ({
      id: cap.id,
      label: cap.label,
      group: CAPABILITY_GROUPS.find(group => group.items.includes(cap.id))?.title || 'Other'
    }));
};

return (
  <div className="dashboard-container">
    <Sidebar activePage="facilities" />
    <main className="main-panel">
      <div className="facilities-container">
        <header className="facilities-header">
          <div className="page-title">
            <h1>Health Facilities</h1>
          </div>
          <div className="header-actions">
            <button className="add-facility-btn" onClick={handleAddFacility}>
              <PlusCircle size={18} />
              <span>Add Facility</span>
            </button>
          </div>
        </header>

        <div className="facilities-controls">
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ward, LGA or type..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <div className="view-filters">
            <button 
              className={`filter-btn ${showFilters ? 'active' : ''}`} 
              onClick={toggleFilters}
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>
            
            <div className="view-toggle">
              <button 
                className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
                <span>List</span>
              </button>
              <button 
                className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                onClick={() => setViewMode('map')}
              >
                <MapIcon size={18} />
                <span>Map</span>
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="filter-panel">
            <div className="filter-group">
              <label>LGA:</label>
              <select name="lga" value={filters.lga} onChange={handleFilterChange}>
                <option value="">All</option>
                {uniqueLGAs.map(lga => (
                  <option key={lga} value={lga}>{lga}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Ward:</label>
              <select name="ward" value={filters.ward} onChange={handleFilterChange}>
                <option value="">All</option>
                {uniqueWards.map(ward => (
                  <option key={ward} value={ward}>{ward}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Facility Type:</label>
              <select name="facilityType" value={filters.facilityType} onChange={handleFilterChange}>
                <option value="">All</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group capability-filter-group">
              <label>Capabilities (select multiple):</label>
              <div className="capability-filter-tabs">
                {CAPABILITY_GROUPS.map((group, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`capability-tab ${activeCapabilityTab === index ? 'active' : ''}`}
                    onClick={() => setActiveCapabilityTab(index)}
                  >
                    {group.title}
                  </button>
                ))}
              </div>
              
              <div className="capability-filter-panels">
                {CAPABILITY_GROUPS.map((group, index) => (
                  <div 
                    key={index} 
                    className={`capability-panel ${activeCapabilityTab === index ? 'active' : ''}`}
                  >
                    {group.items.map(capId => {
                      const capability = CAPABILITIES.find(cap => cap.id === capId);
                      return (
                        <div key={capId} className="capability-checkbox">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={filters.capabilities.includes(capId)}
                              onChange={() => handleCapabilityFilterChange(capId)}
                            />
                            <span className="checkbox-custom">
                              {filters.capabilities.includes(capId) ? <CheckSquare size={16} /> : null}
                            </span>
                            {capability.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              
              {filters.capabilities.length > 0 && (
                <div className="selected-capabilities">
                  <span className="selected-count">{filters.capabilities.length} selected</span>
                  <button 
                    type="button" 
                    className="clear-capabilities-btn"
                    onClick={() => setFilters({...filters, capabilities: []})}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error messages will now be shown in a modal popup instead */}

        <div className="facilities-content">
          {loading ? (
            <div className="loading-indicator">
              <p>Loading facilities...</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="facilities-table-container">
              <table className="facilities-table">
                <thead>
                  <tr>
                    <th className="column-name">Name</th>
                    <th className="column-type">Type</th>
                    <th className="column-ward">Ward</th>
                    <th className="column-lga">LGA</th>
                    <th className="column-capabilities">Key Capabilities</th>
                    <th className="column-coordinates">Coordinates</th>
                    <th className="column-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFacilities.length > 0 ? (
                    filteredFacilities.map(facility => (
                      <tr key={facility.id} className="facility-row">
                        <td className="column-name">{facility.name}</td>
                        <td className="column-type">{facility.facilityType}</td>
                        <td className="column-ward">{facility.ward}</td>
                        <td className="column-lga">{facility.lga}</td>
                        <td className="column-capabilities">
                          <div className="capability-summary">
                            {getCapabilitySummary(facility.capabilities)}
                            <span className="capability-count">
                              {countCapabilities(facility.capabilities)} total
                            </span>
                            
                            {countCapabilities(facility.capabilities) > 0 && (
                              <div className="more-capabilities-wrapper">
                                <button 
                                  className="more-capabilities-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpandedCapabilities(facility.id);
                                  }}
                                >
                                  {expandedFacilityId === facility.id ? "- hide" : "view all"}
                                </button>
                                
                                {expandedFacilityId === facility.id && (
                                  <ExpandedCapabilities 
                                    capabilities={getFacilityCapabilities(facility.capabilities)} 
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="column-coordinates">
                          <MapPin size={14} className="coordinate-icon" />
                          <span className="coordinate-value">
                            {facility.lat ? 
                              `${facility.lat.toFixed(6)}, ${facility.lng.toFixed(6)}` : 
                              'No coordinates'}
                          </span>
                        </td>
                        <td className="column-actions">
                          <div className="action-buttons">
                            <button 
                              className="edit-btn" 
                              onClick={() => handleEditFacility(facility)}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className="delete-btn" 
                              onClick={() => handleDeleteFacility(facility)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="no-results">
                        <p>No facilities found matching your search criteria.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="map-view">
              <div className="map-placeholder">
                <MapIcon size={48} />
                <p>Map view will display health facilities with their capabilities.</p>
                <p>Consider integrating with Google Maps or Leaflet for this feature.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>

    {/* Add Facility Modal */}
    {showAddModal && (
      <div className="modal-overlay">
        <div className="modal-container facility-modal">
          <h2>Add New Health Facility</h2>
          <form className="facility-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label>Facility Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Facility name" 
                  required
                />
              </div>
              <div className="form-group">
                <label>Type of Facility</label>
                <select 
                  name="facilityType"
                  value={formData.facilityType}
                  onChange={handleInputChange}
                  required
                >
                  {FACILITY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ward</label>
                  <input 
                    type="text" 
                    name="ward"
                    value={formData.ward}
                    onChange={handleInputChange}
                    placeholder="Ward" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label>LGA</label>
                  <input 
                    type="text" 
                    name="lga"
                    value={formData.lga}
                    onChange={handleInputChange}
                    placeholder="Local Government Area" 
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Latitude</label>
                  <input 
                    type="text" 
                    name="lat"
                    value={formData.lat}
                    onChange={handleInputChange}
                    placeholder="e.g., 8.4822" 
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Longitude</label>
                  <input 
                    type="text" 
                    name="lng"
                    value={formData.lng}
                    onChange={handleInputChange}
                    placeholder="e.g., -11.7790" 
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section capabilities-section">
              <h3>Facility Capabilities</h3>
              <div className="capability-tabs">
                {CAPABILITY_GROUPS.map((group, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`capability-tab ${activeCapabilityTab === index ? 'active' : ''}`}
                    onClick={() => setActiveCapabilityTab(index)}
                  >
                    {group.title}
                  </button>
                ))}
              </div>
              
              <div className="capability-panels">
                {CAPABILITY_GROUPS.map((group, index) => (
                  <div 
                    key={index} 
                    className={`capability-panel ${activeCapabilityTab === index ? 'active' : ''}`}
                  >
                    {group.items.map(capId => {
                      const capability = CAPABILITIES.find(cap => cap.id === capId);
                      return (
                        <div key={capId} className="capability-checkbox">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedCapabilities[capId] || false}
                              onChange={() => handleCapabilityChange(capId)}
                            />
                            <span className="checkbox-custom">
                              {selectedCapabilities[capId] ? <CheckSquare size={16} /> : null}
                            </span>
                            {capability.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => {
                  setShowAddModal(false);
                  setError(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="save-btn">Register Facility</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Edit Facility Modal */}
    {showEditModal && (
      <div className="modal-overlay">
        <div className="modal-container facility-modal">
          <h2>Edit Health Facility</h2>
          <form className="facility-form" onSubmit={handleUpdate}>
            <div className="form-section">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label>Facility Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Facility name" 
                  required
                />
              </div>
              <div className="form-group">
                <label>Type of Facility</label>
                <select 
                  name="facilityType"
                  value={formData.facilityType}
                  onChange={handleInputChange}
                  required
                >
                  {FACILITY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ward</label>
                  <input 
                    type="text" 
                    name="ward"
                    value={formData.ward}
                    onChange={handleInputChange}
                    placeholder="Ward" 
                    required
                  />
                </div>
                <div className="form-group">
                  <label>LGA</label>
                  <input 
                    type="text" 
                    name="lga"
                    value={formData.lga}
                    onChange={handleInputChange}
                    placeholder="Local Government Area" 
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Latitude</label>
                  <input 
                    type="text" 
                    name="lat"
                    value={formData.lat}
                    onChange={handleInputChange}
                    placeholder="e.g., 8.4822" 
                    required
                  />
                </div>
                <div className="form-group half">
                  <label>Longitude</label>
                  <input 
                    type="text" 
                    name="lng"
                    value={formData.lng}
                    onChange={handleInputChange}
                    placeholder="e.g., -11.7790" 
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section capabilities-section">
              <h3>Facility Capabilities</h3>
              <div className="capability-tabs">
                {CAPABILITY_GROUPS.map((group, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`capability-tab ${activeCapabilityTab === index ? 'active' : ''}`}
                    onClick={() => setActiveCapabilityTab(index)}
                  >
                    {group.title}
                  </button>
                ))}
              </div>
              
              <div className="capability-panels">
                {CAPABILITY_GROUPS.map((group, index) => (
                  <div 
                    key={index} 
                    className={`capability-panel ${activeCapabilityTab === index ? 'active' : ''}`}
                  >
                    {group.items.map(capId => {
                      const capability = CAPABILITIES.find(cap => cap.id === capId);
                      return (
                        <div key={capId} className="capability-checkbox">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={selectedCapabilities[capId] || false}
                              onChange={() => handleCapabilityChange(capId)}
                            />
                            <span className="checkbox-custom">
                              {selectedCapabilities[capId] ? <CheckSquare size={16} /> : null}
                            </span>
                            {capability.label}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedFacility(null);
                  setError(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="save-btn">Update Facility</button>
            </div>
          </form>
        </div>
      </div>
    )}
    
    {/* Delete Confirmation Modal */}
    {showDeleteModal && selectedFacility && (
      <div className="modal-overlay">
        <div className="modal-container delete-modal">
          <h2>Delete Facility</h2>
          <p className="delete-message">
            Are you sure you want to delete "{selectedFacility.name}"? 
            This action cannot be undone.
          </p>
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedFacility(null);
              }}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="delete-confirm-btn" 
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Error Message Modal */}
    {showErrorModal && error && (
      <div className="modal-overlay">
        <div className="modal-container error-modal">
          <h2>Error</h2>
          <p className="error-message">
            {error}
          </p>
          <div className="form-actions">
            <button 
              type="button" 
              className="confirm-btn" 
              onClick={() => setShowErrorModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}

export default FacilitiesPage;

// This component handles the expanded capabilities display
function ExpandedCapabilities({ capabilities }) {
// Group capabilities by their category
const groupedCapabilities = capabilities.reduce((acc, cap) => {
  if (!acc[cap.group]) {
    acc[cap.group] = [];
  }
  acc[cap.group].push(cap);
  return acc;
}, {});

// Sort groups by name for consistent display
const sortedGroups = Object.keys(groupedCapabilities).sort();

return (
  <div className="expanded-capabilities">
    <div className="capabilities-title">All Capabilities:</div>
    <div className="capabilities-groups">
      {sortedGroups.map(group => (
        <div key={group} className="capability-group">
          <div className="capability-group-title">{group}</div>
          <ul className="capabilities-list">
            {groupedCapabilities[group].map(cap => (
              <li key={cap.id} className="capability-item">
                {cap.label}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);
}