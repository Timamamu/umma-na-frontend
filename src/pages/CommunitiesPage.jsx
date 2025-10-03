// CommunitiesPage.jsx
import React, { useState, useEffect } from 'react';
import '../styles/DashboardPage.css';
import '../styles/CommunitiesPage.css';
import Sidebar from '../components/Sidebar';
import { Search, PlusCircle, MapPin, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

//const API_BASE_URL = 'http://localhost:3001';
const API_BASE_URL = "https://umma-na-backend.onrender.com";


function CommunitiesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    settlement: '',
    ward: '',
    lga: '',
    lat: '',
    lng: ''
  });

  // Fetch communities (catchment areas) on component mount
  useEffect(() => {
    const fetchCommunities = async () => {
      console.log("Attempting to fetch communities from", `${API_BASE_URL}/catchment-areas`);
      setLoading(true);
      try {
        // Test with a direct fetch instead of axios to see if there's an issue with axios
        const response = await fetch(`${API_BASE_URL}/catchment-areas`);
        const data = await response.json();
        console.log("Received data:", data);
        setCommunities(data);
      } catch (err) {
        console.error('Error details:', err);
        setError('Failed to load communities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCommunities();
  }, []);
  
  const handleAddCommunity = () => {
    setFormData({
      name: '',
      settlement: '',
      ward: '',
      lga: '',
      lat: '',
      lng: ''
    });
    setShowAddModal(true);
  };
  
  const handleEditCommunity = (community) => {
    // Set selected community for reference
    setSelectedCommunity(community);
    
    // Populate form with community data
    setFormData({
      name: community.name,
      settlement: community.settlement,
      ward: community.ward,
      lga: community.lga,
      lat: community.location ? community.location.lat.toString() : '',
      lng: community.location ? community.location.lng.toString() : ''
    });
    
    setShowEditModal(true);
  };
  
  const handleDeleteCommunity = (community) => {
    setSelectedCommunity(community);
    setShowDeleteModal(true);
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const validateForm = () => {
    // Clear previous errors
    setError(null);
    
    // Simple validation for required fields
    if (!formData.name || !formData.settlement || !formData.ward || !formData.lga) {
      setError('Name, Settlement, Ward, and LGA are required.');
      return false;
    }
    
    // Validate latitude and longitude
    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);
    
    if (isNaN(lat) || isNaN(lng)) {
      setError('Latitude and Longitude must be valid numbers.');
      return false;
    }
    
    if (lat < -90 || lat > 90) {
      setError('Latitude must be between -90 and 90 degrees.');
      return false;
    }
    
    if (lng < -180 || lng > 180) {
      setError('Longitude must be between -180 and 180 degrees.');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const response = await axios.post(`${API_BASE_URL}/register-catchment-area`, {
        name: formData.name,
        settlement: formData.settlement,
        ward: formData.ward,
        lga: formData.lga,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      });
      
      if (response.status === 200) {
        // Add the new community to our local state with the ID from the response
        const newCommunity = {
          id: response.data.id,
          name: formData.name,
          settlement: formData.settlement,
          ward: formData.ward,
          lga: formData.lga,
          location: { 
            lat: parseFloat(formData.lat), 
            lng: parseFloat(formData.lng) 
          },
          createdAt: new Date()
        };
        
        setCommunities([...communities, newCommunity]);
        setShowAddModal(false);
        alert('Community registered successfully!');
      }
    } catch (err) {
      console.error('Error registering community:', err);
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError('Failed to register community. Please try again.');
      }
    }
  };
  
  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedCommunity) return;
    
    try {
      const response = await axios.put(`${API_BASE_URL}/catchment-areas/${selectedCommunity.id}`, {
        name: formData.name,
        settlement: formData.settlement,
        ward: formData.ward,
        lga: formData.lga,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      });
      
      if (response.status === 200) {
        // Update the community in our local state
        const updatedCommunities = communities.map(comm => {
          if (comm.id === selectedCommunity.id) {
            return {
              ...comm,
              name: formData.name,
              settlement: formData.settlement,
              ward: formData.ward,
              lga: formData.lga,
              location: { 
                lat: parseFloat(formData.lat), 
                lng: parseFloat(formData.lng) 
              }
            };
          }
          return comm;
        });
        
        setCommunities(updatedCommunities);
        setShowEditModal(false);
        setSelectedCommunity(null);
        alert('Community updated successfully!');
      }
    } catch (err) {
      console.error('Error updating community:', err);
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError('Failed to update community. Please try again.');
      }
    }
  };
  
  const handleDelete = async () => {
    if (!selectedCommunity) return;
    
    try {
      const response = await axios.delete(`${API_BASE_URL}/catchment-areas/${selectedCommunity.id}`);
      
      if (response.status === 200) {
        // Remove the community from our local state
        const updatedCommunities = communities.filter(comm => comm.id !== selectedCommunity.id);
        setCommunities(updatedCommunities);
        setShowDeleteModal(false);
        setSelectedCommunity(null);
        alert('Community deleted successfully!');
      }
    } catch (err) {
      console.error('Error deleting community:', err);
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError('Failed to delete community. Please try again.');
      }
    }
  };
  
  // Filter communities based on search term
  const filteredCommunities = communities.filter(comm => 
    comm.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comm.settlement?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comm.ward?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comm.lga?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <Sidebar activePage="communities" />
      <main className="main-panel">
        <div className="communities-container">
          <header className="communities-header">
            <div className="page-title">
              <h1>Communities</h1>
            </div>
            <div className="header-actions">
              <button className="add-community-btn" onClick={handleAddCommunity}>
                <PlusCircle size={18} />
                <span>Add Community</span>
              </button>
            </div>
          </header>

          <div className="communities-controls">
            <div className="search-bar">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search by name, settlement, ward or LGA..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="communities-content">
            {loading ? (
              <div className="loading-indicator">
                <p>Loading communities...</p>
              </div>
            ) : (
              <div className="communities-table-container">
                <table className="communities-table">
                  <thead>
                    <tr>
                      <th className="column-name">Name</th>
                      <th className="column-settlement">Settlement</th>
                      <th className="column-ward">Ward</th>
                      <th className="column-lga">LGA</th>
                      <th className="column-coordinates">Coordinates</th>
                      <th className="column-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCommunities.length > 0 ? (
                      filteredCommunities.map(community => (
                        <tr key={community.id} className="community-row">
                          <td className="column-name">{community.name}</td>
                          <td className="column-settlement">{community.settlement}</td>
                          <td className="column-ward">{community.ward}</td>
                          <td className="column-lga">{community.lga}</td>
                          <td className="column-coordinates">
                            <MapPin size={14} className="coordinate-icon" />
                            <span className="coordinate-value">
                              {community.location ? 
                                `${community.location.lat.toFixed(6)}, ${community.location.lng.toFixed(6)}` : 
                                'No coordinates'}
                            </span>
                          </td>
                          <td className="column-actions">
                            <div className="action-buttons">
                              <button 
                                className="edit-btn" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCommunity(community);
                                }}
                              >
                                <Edit2 size={16} />
                              </button>
                              <button 
                                className="delete-btn" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCommunity(community);
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="no-results">
                          <p>No communities found matching your search criteria.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Community Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Add New Community</h2>
            <form className="community-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Community name" 
                  required
                />
              </div>
              <div className="form-group">
                <label>Settlement/Community</label>
                <input 
                  type="text" 
                  name="settlement"
                  value={formData.settlement}
                  onChange={handleInputChange}
                  placeholder="Settlement name" 
                  required
                />
              </div>
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
                <label>LGA (Local Government Area)</label>
                <input 
                  type="text" 
                  name="lga"
                  value={formData.lga}
                  onChange={handleInputChange}
                  placeholder="LGA" 
                  required
                />
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
                <button type="submit" className="save-btn">Register Community</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Community Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2>Edit Community</h2>
            <form className="community-form" onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Community name" 
                  required
                />
              </div>
              <div className="form-group">
                <label>Settlement/Community</label>
                <input 
                  type="text" 
                  name="settlement"
                  value={formData.settlement}
                  onChange={handleInputChange}
                  placeholder="Settlement name" 
                  required
                />
              </div>
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
                <label>LGA (Local Government Area)</label>
                <input 
                  type="text" 
                  name="lga"
                  value={formData.lga}
                  onChange={handleInputChange}
                  placeholder="LGA" 
                  required
                />
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
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedCommunity(null);
                    setError(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="save-btn">Update Community</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCommunity && (
        <div className="modal-overlay">
          <div className="modal-container delete-modal">
            <h2>Delete Community</h2>
            <p className="delete-message">
              Are you sure you want to delete the community "{selectedCommunity.name}"? 
              This action cannot be undone.
            </p>
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedCommunity(null);
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
    </div>
  );
}

export default CommunitiesPage;