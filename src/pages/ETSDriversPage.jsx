// ETSDriversPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../styles/DashboardPage.css';
import '../styles/ETSDriversPage.css';
import Sidebar from '../components/Sidebar';
import { MapPin, List, PlusCircle, Search, Edit2, Trash2, Phone, MapIcon, Filter, X } from 'lucide-react';
import axios from 'axios'; 

//const API_BASE_URL = 'http://localhost:3001'; 
const API_BASE_URL = "https://umma-na-backend.onrender.com";


function ETSDriversPage() {
  const [viewMode, setViewMode] = useState('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [etsDrivers, setEtsDrivers] = useState([]);
  const [catchmentAreas, setCatchmentAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [expandedDriverId, setExpandedDriverId] = useState(null);
  
  // Refs
  const communitySearchRefs = useRef([]);
  const communityButtonRefs = useRef({});
  
  // Community search state
  const [communitySearchTerms, setCommunitySearchTerms] = useState(['']);
  const [communitySearchResults, setCommunitySearchResults] = useState([[]]);
  const [showCommunityResults, setShowCommunityResults] = useState([false]);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    vehicleType: 'car',
    catchmentAreaIds: ['']
  });
  
  // Filter state
  const [filters, setFilters] = useState({
    lga: '',
    ward: '',
    vehicleType: ''
  });

  // Fetch ETS drivers and catchment areas on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch both ETS drivers and catchment areas in parallel
        const [driversResponse, areasResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/ets-drivers`),
          axios.get(`${API_BASE_URL}/catchment-areas`)
        ]);
        
        // Process drivers data to match our UI requirements
        const processedDrivers = driversResponse.data.map(driver => {
          const driverAreas = driver.assignedCatchmentAreas?.map(id => {
            const area = areasResponse.data.find(a => a.id === id);
            return area ? {
              id: area.id,
              name: area.name,
              settlement: area.settlement,
              ward: area.ward,
              lga: area.lga
            } : { id: null, name: 'Unknown Area', settlement: '', ward: '', lga: '' };
          }) || [];
          
          // Get the primary area (first one, or unknown if none)
          const primaryArea = driverAreas.length > 0 ? driverAreas[0] : { settlement: '', ward: '', lga: '' };
          
          return {
            id: driver.id,
            name: `${driver.firstName} ${driver.lastName}`,
            firstName: driver.firstName,
            lastName: driver.lastName,
            phone: driver.phoneNumber,
            vehicleType: driver.vehicleType,
            areas: driverAreas,
            primaryArea,
            catchmentCount: driver.assignedCatchmentAreas?.length || 0,
            catchmentAreaIds: driver.assignedCatchmentAreas || [],
            isAvailable: driver.isAvailable || true
          };
        });
        
        setEtsDrivers(processedDrivers);
        setCatchmentAreas(areasResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle clicking outside community search results and expanded communities
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle community search results
      communitySearchRefs.current.forEach((ref, index) => {
        if (ref && !ref.contains(event.target)) {
          setShowCommunityResults(prev => {
            const updated = [...prev];
            updated[index] = false;
            return updated;
          });
        }
      });
      
      // Close expanded communities when clicking elsewhere
      if (expandedDriverId && !event.target.closest('.more-areas-btn')) {
        setExpandedDriverId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedDriverId]);
  
  const handleAddDriver = () => {
    setEditMode(false);
    setFormData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      vehicleType: 'car',
      catchmentAreaIds: ['']
    });
    setCommunitySearchTerms(['']);
    setCommunitySearchResults([[]]);
    setShowCommunityResults([false]);
    setShowAddModal(true);
  };
  
  const handleEditDriver = (driver) => {
    setEditMode(true);
    setCurrentDriver(driver);
    
    // Get the community names for the search inputs
    const communityNames = driver.catchmentAreaIds.map(id => {
      const area = catchmentAreas.find(area => area.id === id);
      return area ? area.name : '';
    });

    setFormData({
      firstName: driver.firstName,
      lastName: driver.lastName,
      phoneNumber: driver.phone,
      vehicleType: driver.vehicleType,
      catchmentAreaIds: [...driver.catchmentAreaIds]
    });

    setCommunitySearchTerms(communityNames);
    setCommunitySearchResults(driver.catchmentAreaIds.map(() => []));
    setShowCommunityResults(driver.catchmentAreaIds.map(() => false));
    
    setShowAddModal(true);
  };
  
  const handleDeleteDriver = (driver) => {
    setCurrentDriver(driver);
    setShowDeleteModal(true);
  };

  const confirmDeleteDriver = async () => {
    if (!currentDriver) return;

    try {
      // Delete the driver
      await axios.delete(`${API_BASE_URL}/ets-drivers/${currentDriver.id}`);
      
      // Remove the driver from our local state
      setEtsDrivers(etsDrivers.filter(d => d.id !== currentDriver.id));
      setShowDeleteModal(false);
      setCurrentDriver(null);
      alert('ETS driver deleted successfully!');
    } catch (err) {
      console.error('Error deleting ETS driver:', err);
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError('Failed to delete ETS driver. Please try again.');
      }
    }
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
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCommunitySearchChange = (index, value) => {
    // Update search term
    const updatedSearchTerms = [...communitySearchTerms];
    updatedSearchTerms[index] = value;
    setCommunitySearchTerms(updatedSearchTerms);

    // Show search results
    const updatedShowResults = [...showCommunityResults];
    updatedShowResults[index] = true;
    setShowCommunityResults(updatedShowResults);

    // Filter communities based on search term
    if (value.trim() === '') {
      const updatedResults = [...communitySearchResults];
      updatedResults[index] = [];
      setCommunitySearchResults(updatedResults);
    } else {
      const filteredCommunities = catchmentAreas.filter(area => 
        area.name.toLowerCase().includes(value.toLowerCase()) ||
        area.settlement.toLowerCase().includes(value.toLowerCase()) ||
        area.ward.toLowerCase().includes(value.toLowerCase()) ||
        area.lga.toLowerCase().includes(value.toLowerCase())
      );
      
      const updatedResults = [...communitySearchResults];
      updatedResults[index] = filteredCommunities;
      setCommunitySearchResults(updatedResults);
    }

    // Clear the catchment area ID if user is typing new search
    const updatedCatchmentAreaIds = [...formData.catchmentAreaIds];
    updatedCatchmentAreaIds[index] = '';
    setFormData({
      ...formData,
      catchmentAreaIds: updatedCatchmentAreaIds
    });
  };

  const handleCommunitySelect = (index, area) => {
    // Update catchment area IDs
    const updatedCatchmentAreaIds = [...formData.catchmentAreaIds];
    updatedCatchmentAreaIds[index] = area.id;
    setFormData({
      ...formData,
      catchmentAreaIds: updatedCatchmentAreaIds
    });

    // Update search term to selected community name
    const updatedSearchTerms = [...communitySearchTerms];
    updatedSearchTerms[index] = area.name;
    setCommunitySearchTerms(updatedSearchTerms);

    // Hide search results
    const updatedShowResults = [...showCommunityResults];
    updatedShowResults[index] = false;
    setShowCommunityResults(updatedShowResults);
  };
  
  const addCommunityField = () => {
    setFormData({
      ...formData,
      catchmentAreaIds: [...formData.catchmentAreaIds, '']
    });
    setCommunitySearchTerms([...communitySearchTerms, '']);
    setCommunitySearchResults([...communitySearchResults, []]);
    setShowCommunityResults([...showCommunityResults, false]);
    
    // Add a new ref for the new search field
    communitySearchRefs.current = [...communitySearchRefs.current, null];
  };
  
  const removeCommunityField = (index) => {
    const updatedCatchmentAreaIds = [...formData.catchmentAreaIds];
    updatedCatchmentAreaIds.splice(index, 1);
    setFormData({
      ...formData,
      catchmentAreaIds: updatedCatchmentAreaIds
    });

    const updatedSearchTerms = [...communitySearchTerms];
    updatedSearchTerms.splice(index, 1);
    setCommunitySearchTerms(updatedSearchTerms);

    const updatedResults = [...communitySearchResults];
    updatedResults.splice(index, 1);
    setCommunitySearchResults(updatedResults);

    const updatedShowResults = [...showCommunityResults];
    updatedShowResults.splice(index, 1);
    setShowCommunityResults(updatedShowResults);

    // Remove the ref for the removed search field
    communitySearchRefs.current = communitySearchRefs.current.filter((_, i) => i !== index);
  };
  
  const validateForm = () => {
    setError(null);
    
    // Simple validation for required fields
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber || !formData.vehicleType) {
      setError('Name, phone number, and vehicle type are required.');
      return false;
    }
    
    // Validate phone number format (Nigerian mobile)
    const phoneRegex = /^0[789][01]\d{8}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError('Invalid phone number format. Must be Nigerian mobile format (e.g., 08012345678)');
      return false;
    }
    
    // Check if catchment areas are selected
    const validCatchmentAreaIds = formData.catchmentAreaIds.filter(id => id);
    if (validCatchmentAreaIds.length === 0) {
      setError('At least one community must be selected.');
      return false;
    }
    
    // Validate vehicle type
    if (!['car', 'motorcycle'].includes(formData.vehicleType)) {
      setError('Vehicle type must be either "car" or "motorcycle".');
      return false;
    }
    
    return true;
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Filter out empty catchment area selections
    const validCatchmentAreaIds = formData.catchmentAreaIds.filter(id => id);
    
    try {
      let response;
      
      if (!editMode) {
        // Creating a new ETS driver
        response = await axios.post(`${API_BASE_URL}/register-ets-driver`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          vehicleType: formData.vehicleType,
          catchmentAreaIds: validCatchmentAreaIds
        });
        
        if (response.status === 200) {
          // Process driver areas for the UI
          const driverAreas = validCatchmentAreaIds.map(id => {
            const area = catchmentAreas.find(area => area.id === id);
            return area ? {
              id: area.id,
              name: area.name,
              settlement: area.settlement,
              ward: area.ward,
              lga: area.lga
            } : { id: null, name: 'Unknown Area', settlement: '', ward: '', lga: '' };
          });
          
          // Get the primary area (first one, or unknown if none)
          const primaryArea = driverAreas.length > 0 ? driverAreas[0] : { settlement: '', ward: '', lga: '' };
          
          const newDriver = {
            id: response.data.id,
            name: `${formData.firstName} ${formData.lastName}`,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phoneNumber,
            vehicleType: formData.vehicleType,
            areas: driverAreas,
            primaryArea,
            catchmentCount: validCatchmentAreaIds.length,
            catchmentAreaIds: validCatchmentAreaIds,
            isAvailable: true
          };
          
          setEtsDrivers([...etsDrivers, newDriver]);
          setShowAddModal(false);
          alert('ETS driver added successfully!');
        }
      } else {
        // Updating an existing ETS driver
        response = await axios.patch(`${API_BASE_URL}/update-ets-driver/${currentDriver.id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          vehicleType: formData.vehicleType,
          assignedCatchmentAreas: validCatchmentAreaIds
        });
        
        if (response.status === 200) {
          // Process driver areas for the UI
          const driverAreas = validCatchmentAreaIds.map(id => {
            const area = catchmentAreas.find(area => area.id === id);
            return area ? {
              id: area.id,
              name: area.name,
              settlement: area.settlement,
              ward: area.ward,
              lga: area.lga
            } : { id: null, name: 'Unknown Area', settlement: '', ward: '', lga: '' };
          });
          
          // Get the primary area (first one, or unknown if none)
          const primaryArea = driverAreas.length > 0 ? driverAreas[0] : { settlement: '', ward: '', lga: '' };
          
          // Update the driver in local state
          const updatedDrivers = etsDrivers.map(driver => {
            if (driver.id === currentDriver.id) {
              return {
                ...driver,
                name: `${formData.firstName} ${formData.lastName}`,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phoneNumber,
                vehicleType: formData.vehicleType,
                areas: driverAreas,
                primaryArea,
                catchmentCount: validCatchmentAreaIds.length,
                catchmentAreaIds: validCatchmentAreaIds
              };
            }
            return driver;
          });
          
          setEtsDrivers(updatedDrivers);
          setShowAddModal(false);
          setCurrentDriver(null);
          alert('ETS driver updated successfully!');
        }
      }
    } catch (err) {
      console.error('Error saving ETS driver:', err);
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError('Failed to save ETS driver. Please try again.');
      }
    }
  };
  
  // Extract unique wards and LGAs for filtering
  const uniqueWards = [...new Set(catchmentAreas.map(area => area.ward))].filter(Boolean).sort();
  const uniqueLGAs = [...new Set(catchmentAreas.map(area => area.lga))].filter(Boolean).sort();

  // Filter drivers based on search term and filters
  const filteredDrivers = etsDrivers.filter(driver => {
    // Search term filter
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.areas.some(area => 
        area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        area.settlement.toLowerCase().includes(searchTerm.toLowerCase()) ||
        area.ward.toLowerCase().includes(searchTerm.toLowerCase()) ||
        area.lga.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    if (!matchesSearch) return false;
    
    // Apply additional filters
    if (filters.lga) {
      const matchesLGA = driver.areas.some(area => 
        area.lga.toLowerCase() === filters.lga.toLowerCase()
      );
      if (!matchesLGA) return false;
    }
    
    if (filters.ward) {
      const matchesWard = driver.areas.some(area => 
        area.ward.toLowerCase() === filters.ward.toLowerCase()
      );
      if (!matchesWard) return false;
    }
    
    if (filters.vehicleType) {
      if (driver.vehicleType.toLowerCase() !== filters.vehicleType.toLowerCase()) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div className="dashboard-container">
      <Sidebar activePage="drivers" />
      <main className="main-panel">
        <div className="ets-container">
          <header className="ets-header">
            <div className="page-title">
              <h1>ETS Drivers</h1>
            </div>
            <div className="header-actions">
              <button className="add-driver-btn" onClick={handleAddDriver}>
                <PlusCircle size={18} />
                <span>Add ETS Driver</span>
              </button>
            </div>
          </header>

          <div className="ets-controls">
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search by name, vehicle type or location..."
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
                <label>Vehicle Type:</label>
                <select name="vehicleType" value={filters.vehicleType} onChange={handleFilterChange}>
                  <option value="">All</option>
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="ets-content">
            {loading ? (
              <div className="loading-indicator">
                <p>Loading ETS drivers...</p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="drivers-table-container">
                <table className="drivers-table">
                  <thead>
                    <tr>
                      <th className="column-name">Name</th>
                      <th className="column-contact">Contact</th>
                      <th className="column-vehicle">Vehicle</th>
                      <th className="column-settlement">Settlement</th>
                      <th className="column-ward">Ward</th>
                      <th className="column-lga">LGA</th>
                      <th className="column-status">Status</th>
                      <th className="column-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDrivers.length > 0 ? (
                      filteredDrivers.map(driver => (
                        <tr key={driver.id} className="driver-row">
                          <td className="column-name">{driver.name}</td>
                          <td className="column-contact">
                            <Phone size={14} />
                            <span>{driver.phone}</span>
                          </td>
                          <td className="column-vehicle">
                            {driver.vehicleType}
                          </td>
                          <td className="column-settlement">
                            {driver.primaryArea.settlement}
                            {driver.catchmentCount > 1 && (
                              <div className="more-communities-wrapper">
                                <button 
                                  className="more-areas-btn"
                                  ref={el => communityButtonRefs.current[driver.id] = el}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedDriverId(expandedDriverId === driver.id ? null : driver.id);
                                  }}
                                >
                                  {expandedDriverId === driver.id ? "- hide" : `+${driver.catchmentCount - 1} more`}
                                </button>
                                
                                {expandedDriverId === driver.id && (
                                  <ExpandedCommunities 
                                    driver={driver} 
                                    buttonRef={communityButtonRefs.current[driver.id]} 
                                  />
                                )}
                              </div>
                            )}
                          </td>
                          <td className="column-ward">
                            {driver.primaryArea.ward}
                          </td>
                          <td className="column-lga">
                            {driver.primaryArea.lga}
                          </td>
                          <td className="column-status">
                            <span className={`status-badge ${driver.isAvailable ? 'available' : 'unavailable'}`}>
                              {driver.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          <td className="column-actions">
                            <div className="action-buttons">
                              <button className="edit-btn" onClick={() => handleEditDriver(driver)}>
                                <Edit2 size={16} />
                              </button>
                              <button className="delete-btn" onClick={() => handleDeleteDriver(driver)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="no-results">
                          <p>No ETS drivers found matching your search criteria.</p>
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
                  <p>Map view will display ETS drivers in their communities.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Driver Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>{editMode ? 'Edit ETS Driver' : 'Add New ETS Driver'}</h2>
            <form className="driver-form" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>First Name</label>
                <input 
                  type="text" 
                  name="firstName"
                  value={formData.firstName} 
                  onChange={handleInputChange}
                  placeholder="First name" 
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange} 
                  placeholder="Last name" 
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Phone number (e.g., 08012345678)" 
                  required
                />
                <small>Format: Nigerian mobile number (e.g., 08012345678)</small>
              </div>
              <div className="form-group">
                <label>Vehicle Type</label>
                <select 
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </div>
              <div className="form-group">
                <label>Communities</label>
                {formData.catchmentAreaIds.map((areaId, index) => (
                  <div key={index} className="community-search-container" ref={el => communitySearchRefs.current[index] = el}>
                    <div className="search-input-container">
                      <input 
                        type="text"
                        placeholder="Search for community..." 
                        value={communitySearchTerms[index]}
                        onChange={(e) => handleCommunitySearchChange(index, e.target.value)}
                        className="community-search-input"
                      />
                      {index > 0 && (
                        <button 
                          type="button" 
                          className="remove-area-btn"
                          onClick={() => removeCommunityField(index)}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    {showCommunityResults[index] && communitySearchResults[index].length > 0 && (
                      <div className="community-search-results">
                        {communitySearchResults[index].map(area => (
                          <div 
                            key={area.id} 
                            className="community-result-item"
                            onClick={() => handleCommunitySelect(index, area)}
                          >
                            <div className="community-result-name">{area.name}</div>
                            <div className="community-result-location">{area.settlement} - {area.ward}, {area.lga}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {formData.catchmentAreaIds.length < 5 && (
                  <button 
                    type="button" 
                    className="add-area-btn"
                    onClick={addCommunityField}
                  >
                    + Add Community
                  </button>
                )}
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditMode(false);
                    setCurrentDriver(null);
                    setError(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editMode ? 'Update Driver' : 'Save Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentDriver && (
        <div className="modal-overlay">
          <div className="modal-container delete-modal">
            <h2>Delete ETS Driver</h2>
            <p className="delete-message">
              Are you sure you want to delete {currentDriver.name}? This action cannot be undone.
            </p>
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setCurrentDriver(null);
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="delete-confirm-btn" 
                onClick={confirmDeleteDriver}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// This component handles the expanded communities display with proper positioning
function ExpandedCommunities({ driver, buttonRef }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  useEffect(() => {
    if (buttonRef) {
      const rect = buttonRef.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 5,
        left: rect.left + window.scrollX
      });
    }
  }, [buttonRef]);

  return (
    <div 
      className="expanded-communities" 
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <div className="communities-title">All Communities:</div>
      <ul className="communities-list">
        {driver.areas.map((area, index) => (
          <li key={index} className="community-item">
            <div className="community-name">{area.name}</div>
            <div className="community-details">{area.settlement} - {area.ward}, {area.lga}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ETSDriversPage;