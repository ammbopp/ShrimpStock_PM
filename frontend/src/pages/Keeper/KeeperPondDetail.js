import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import './KeeperPond.css';

function KeeperPondDetail() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pond, setPond] = useState(null);
  const [pondHistory, setPondHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPondUsedDetails, setCurrentPondUsedDetails] = useState(null);
  const { pond_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get employee data from location state
  const { employee_fname, employee_lname, employee_image, employee_id, employee_position } = location.state || {};
  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  useEffect(() => {
    fetchPondData();
    fetchPondHistory();
  }, [pond_id]);

  // Function to fetch pond data
  const fetchPondData = async () => {
    setLoading(true);
    try {
      // Fetch pond details
      const pondResponse = await axios.get(`/api/ponds/${pond_id}`);
      if (pondResponse.data && pondResponse.data.length > 0) {
        setPond(pondResponse.data[0]);
        
        // If pond is open, fetch details for the current_used_id
        if (pondResponse.data[0].pond_status === 'OPEN' && pondResponse.data[0].current_used_id) {
          fetchPondUsedDetails(pondResponse.data[0].current_used_id);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pond data:', error);
      setLoading(false);
    }
  };

  // Function to fetch pond history
  const fetchPondHistory = async () => {
    try {
      const historyResponse = await axios.get(`/api/ponds/allHistory/${pond_id}`);
      if (historyResponse.data) {
        setPondHistory(historyResponse.data);
      }
    } catch (error) {
      console.error('Error fetching pond history:', error);
    }
  };

  // Function to fetch details for a specific pond_used_id
  const fetchPondUsedDetails = async (pond_used_id) => {
    try {
      const response = await axios.get(`/api/pond/detail/${pond_used_id}`);
      if (response.data) {
        setCurrentPondUsedDetails(response.data);
      }
    } catch (error) {
      console.error('Error fetching pond used details:', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navigateToPage = (path) => {
    navigate(path, {
      state: {
        employee_id,
        employee_fname,
        employee_lname,
        employee_image,
        employee_position,
      },
    });
  };

  const handleViewDetail = (pond_used_id) => {
    navigate(`/keeper/pond/history/${pond_used_id}`, {
      state: {
        employee_id,
        employee_fname,
        employee_lname,
        employee_image,
        employee_position,
        pond_id,
        pond_used_id
      },
    });
  };

  const handleClosePond = async () => {
    try {
      await axios.put(`/api/pond/status/close/${pond_id}`, {
        pond_status: 'CLOSE'
      });
      // Refresh pond data after status change
      fetchPondData();
    } catch (error) {
      console.error('Error closing pond:', error);
    }
  };

  // Handle pond opening and navigate to another page
  // Handle pond opening and navigate to KeeperOpenPond page
// Handle pond opening and navigate to another page
// Handle pond opening and navigate to KeeperOpenPond page
const handleOpenPond = () => {
  console.log("Open button clicked for pond ID:", pond_id);
  
  // แทนที่จะเรียก API โดยตรง ให้นำทางไปยังหน้า KeeperOpenPond เลย
  // เนื่องจากหน้า KeeperOpenPond จะมีการเลือกพนักงานและทำการเปิดบ่อในขั้นตอนถัดไป
  console.log("Navigating to:", `/keeper/pond/open/${pond_id}`);
  navigate(`/keeper/pond/open/${pond_id}`);
};

  // View details of a historical pond_used_id
  const viewHistoryDetails = (pond_used_id) => {
    fetchPondUsedDetails(pond_used_id);
    handleViewDetail(pond_used_id);
  };

  return (
    <div className="page-container">
      {/* Fixed Navbar */}
      <div className="navbar" style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        width: '60%',
        zIndex: 1000,
        backgroundColor: '#FFFFFF',
        boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)'
      }}>
        <div className="logo">
          <img src={shrimpLogo} alt="Shrimp Logo" />
          <button className="menu-button" onClick={toggleMenu}>
            <span className="menu-icon">&#9776;</span>
          </button>
          <span>Shrimp Farm</span>
        </div>
        <div className="user-profile">
          <img src={employeeImagePath} alt="User Profile" style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%' 
          }} />
        </div>
      </div>

      {/* Side Menu */}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li onClick={() => navigateToPage('/keeper/home')}>Home</li>
          <li onClick={() => navigateToPage('/keeper/profile')}>Profile</li>
          <li onClick={() => navigateToPage('/keeper/products')}>Products</li>
          <li onClick={() => navigateToPage('/keeper/requests')}>Requests</li>
          <li onClick={() => navigateToPage('/keeper/orders')}>Orders</li>
          <li onClick={() => navigateToPage('/keeper/audit')}>Audits</li>
          <li onClick={() => navigateToPage('/keeper/pond')}>Ponds</li>
          <li onClick={() => navigateToPage('/keeper/employee')}>Employees</li>
          <li onClick={() => navigateToPage('/login')}>Logout</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        {/* Content Body */}
        {loading ? (
          <div className="loading-container" style={{
            height: '60vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <div className="loading-indicator" style={{
              fontSize: '18px',
              color: '#c75e39',
              fontWeight: '500',
              letterSpacing: '0.5px',
              textAlign: 'center',
              padding: '15px 30px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.8)',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            }}>
              <div style={{ marginBottom: '12px' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" style={{ animation: 'spin 1.5s linear infinite' }}>
                  <style>{`
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                  <circle cx="12" cy="12" r="10" fill="none" stroke="#c75e39" strokeWidth="2" strokeDasharray="32" strokeDashoffset="32" />
                </svg>
              </div>
              Loading pond details...
            </div>
          </div>
        ) : pond ? (
          <div className="pond-detail-container" style={{
            padding: '20px 40px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {/* Back button - positioned to avoid menu overlap */}
            <button 
              onClick={() => navigateToPage('/keeper/pond')} 
              className="back-button" 
              style={{
                backgroundColor: '#c75e39',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 25px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                position: 'relative',
                marginTop: '20px',
                marginBottom: '30px',
                zIndex: 5,
              }}
            >
              BACK
            </button>

            {/* Pond Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              margin: '40px 0 30px 0',
              padding: '0 60px',
            }}>
              {/* Left side - Pond name and Size */}
              <div style={{ textAlign: 'left' }}>
                <h1 style={{
                  fontSize: '42px',
                  fontWeight: 'bold',
                  color: '#c75e39',
                  margin: '0',
                }}>{pond.pond_name || `${pond.pond_id}`}</h1>
                <h2 style={{
                  fontSize: '26px',
                  color: '#c75e39',
                  fontWeight: 'normal',
                  margin: '10px 0 0 0',
                }}>Size: {pond.pond_size || 'N/A'}</h2>
              </div>

              {/* Right side - Status buttons */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end'
              }}>
                <div style={{
                  display: 'inline-block',
                  color: pond.pond_status === 'OPEN' ? '#4CAF50' : '#f44336',
                  fontWeight: 'bold',
                  marginBottom: '15px',
                  fontSize: '18px'
                }}>
                  {pond.pond_status}
                </div>

                {pond.pond_status === 'OPEN' ? (
                  <button
                    onClick={handleClosePond}
                    style={{
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 30px',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginLeft: '50px',
                    }}
                  >
                    CLOSE
                  </button>
                ) : (
                  <div>
                    <button
                      onClick={handleOpenPond}
                      style={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '10px 30px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginLeft: '50px',
                      }}
                    >
                      OPEN
                    </button>
                    <div style={{
                      color: '#333',
                      fontSize: '14px',
                      marginTop: '10px',
                      maxWidth: '300px',
                      textAlign: 'right',
                      display: 'none', // Hide explanatory text
                    }}>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Current Usage Section */}
            {pond.pond_status === 'OPEN' && pond.current_used_id && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '25px 30px',
                marginTop: '20px',
                marginBottom: '30px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{
                    color: '#c75e39',
                    fontSize: '18px',
                    fontWeight: '600',
                    margin: 0,
                  }}>Currently being used by {pond.current_used_id}</h3>
                  
                  <button 
                    className="view-button" 
                    onClick={() => handleViewDetail(pond.current_used_id)}
                    style={{
                      backgroundColor: '#2c3e50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '15px',
                      cursor: 'pointer',
                    }}
                  >
                    View Detail
                  </button>
                </div>

                {currentPondUsedDetails && (
                  <div style={{
                    marginTop: '20px',
                    paddingTop: '15px',
                    borderTop: '1px dashed #e0e0e0',
                  }}>
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#444',
                      marginBottom: '12px',
                    }}>Products used:</h4>
                    
                    <ul style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: 0,
                      background: 'white',
                      borderRadius: '8px',
                    }}>
                      {currentPondUsedDetails.map((item, index) => (
                        <li key={index} style={{
                          padding: '12px 0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: index !== currentPondUsedDetails.length - 1 ? '1px solid #f0f0f0' : 'none',
                        }}>
                          <span style={{
                            fontWeight: '500',
                            color: '#333'
                          }}>{item.product_name}</span>
                          <span style={{
                            fontWeight: '600',
                            color: '#c75e39',
                            fontSize: '14px',
                          }}>{item.REQUEST_QUANTITY} {item.unit_name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* History Section */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '25px 30px',
              marginTop: '20px',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '25px'
              }}>
                <h2 style={{
                  color: '#c75e39',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  margin: '0',
                }}>History</h2>
                <div style={{
                  color: '#333',
                  fontSize: '14px',
                  maxWidth: '400px',
                  display: 'none', // Hide explanatory text
                }}>
                  {/* Explanatory text hidden in production */}
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px'
              }}>
                {pondHistory.length === 0 ? (
                  <p style={{
                    fontSize: '16px',
                    color: '#888',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '20px 0',
                  }}>No history found for this pond</p>
                ) : (
                  pondHistory.map((item, index) => (
                    <div key={index} style={{
                      backgroundColor: 'white',
                      border: '1px solid #eee',
                      borderRadius: '10px',
                      padding: '20px 25px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#333',
                        margin: '0',
                      }}>ID : {String(index).padStart(1, '0')}{item.pond_used_id}</h3>
                      
                      <button 
                        onClick={() => viewHistoryDetails(item.pond_used_id)}
                        style={{
                          backgroundColor: '#2c3e50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '8px 16px',
                          fontSize: '15px',
                          cursor: 'pointer',
                          marginLeft: '40px',
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="not-found-container" style={{
            height: '50vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '30px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            margin: '20px',
          }}>
            <div style={{
              fontSize: '80px',
              color: '#ddd',
              marginBottom: '20px',
            }}>
              🔍
            </div>
            <p style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '20px',
              textAlign: 'center',
            }}>Pond not found</p>
            <button 
              onClick={() => navigateToPage('/keeper/pond')}
              style={{
                backgroundColor: '#c75e39',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 3px 8px rgba(199, 94, 57, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              Back to Ponds
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default KeeperPondDetail;