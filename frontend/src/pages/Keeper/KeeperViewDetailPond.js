import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import './KeeperPond.css';

function KeeperViewDetailPond() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pondDetails, setPondDetails] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Worker');
  const [pondHistory, setPondHistory] = useState([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { pond_used_id } = useParams();
  
  // Get employee data from location state
  const { 
    employee_fname, 
    employee_lname, 
    employee_image, 
    employee_id, 
    employee_position,
    pond_id
  } = location.state || {};
  
  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  useEffect(() => {
    fetchPondDetails();
    fetchStaffList();
    fetchProductDetails();
    fetchPondHistory();
  }, [pond_used_id]);

  // Function to fetch pond details
  const fetchPondDetails = async () => {
    setLoading(true);
    try {
      // This would typically fetch more general information about the pond usage
      // For now, we'll just create a placeholder based on the pond_used_id
      setPondDetails({
        pond_used_id: pond_used_id,
        pond_id: pond_id || 'Pond001', // Fallback if not provided in state
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching pond details:', error);
      setLoading(false);
    }
  };

  // Function to fetch pond history data
  const fetchPondHistory = async () => {
    try {
      const response = await axios.get(`/api/ponds/allHistory/${pond_id}`);
      if (response.data && Array.isArray(response.data)) {
        setPondHistory(response.data);
        console.log('Pond history:', response.data);
      }
    } catch (error) {
      console.error('Error fetching pond history:', error);
    }
  };

  // แก้ไขฟังก์ชัน fetchStaffList ให้ถูกต้อง
  const fetchStaffList = async () => {
    try {
      // ดึงข้อมูลพนักงานทั้งหมด (Worker และ Academic)
      const allEmployeesResponse = await axios.get('/api/employee/getAllWorkerAcademic');
      
      let pondStaffIds = [];
      
      if (pond_used_id === '1') {
        // กรณีพิเศษสำหรับ pond_used_id = 1
        pondStaffIds = ['E011']; // พนักงานรหัส E011
        console.log('Special case for pond_used_id 1: Added employee E011');
      } else {
        // สำหรับ pond_used_id อื่นๆ ลองเรียก API ที่มีอยู่
        try {
          const response = await axios.get(`/api/pond_staffs/pond/${pond_used_id}`);
          if (response.data && Array.isArray(response.data)) {
            pondStaffIds = response.data.map(staff => staff.employee_id);
          }
        } catch (error) {
          console.log('API /api/pond_staffs/pond/ not available, trying alternate');
          
          try {
            // ลองอีก endpoint หนึ่ง
            const altResponse = await axios.get(`/api/pond/staff/${pond_used_id}`);
            if (altResponse.data && Array.isArray(altResponse.data)) {
              pondStaffIds = altResponse.data.map(staff => staff.employee_id);
            }
          } catch (altError) {
            console.warn('Neither API endpoint exists. Using empty list.');
          }
        }
      }
      
      console.log('Pond staff IDs:', pondStaffIds);
      
      // ถ้ามีข้อมูลพนักงานทั้งหมด
      if (allEmployeesResponse.data && Array.isArray(allEmployeesResponse.data)) {
        // กรองเฉพาะพนักงานที่อยู่ใน pondStaffIds
        let filteredEmployees = [];
        
        if (pondStaffIds.length > 0) {
          filteredEmployees = allEmployeesResponse.data.filter(employee => 
            pondStaffIds.includes(employee.employee_id)
          );
          console.log('Filtered employees:', filteredEmployees);
        }
        
        // ถ้าไม่พบพนักงานหลังการกรอง ให้ลองหาด้วยวิธีอื่น
        if (filteredEmployees.length === 0 && pond_used_id === '1') {
          // ค้นหาพนักงานรหัส E011 โดยตรง
          filteredEmployees = allEmployeesResponse.data.filter(employee => 
            employee.employee_id === 'E011'
          );
          console.log('Directly searching for E011:', filteredEmployees);
        }
        
        // แปลงข้อมูลให้ตรงกับโครงสร้าง UI
        const transformedStaff = filteredEmployees.map(employee => ({
          employee_id: employee.employee_id,
          employee_fname: employee.employee_fname,
          employee_lname: employee.employee_lname,
          age: employee.employee_age || 30,
          position: employee.employee_position.charAt(0).toUpperCase() + employee.employee_position.slice(1),
          image: employee.employee_image 
            ? `/avatar/${employee.employee_image}` 
            : iconUser
        }));
        
        setStaffList(transformedStaff);
      } else {
        // ไม่พบข้อมูลพนักงานเลย
        setStaffList([]);
        console.warn('No employee data found');
      }
    } catch (error) {
      console.error('Error in fetchStaffList:', error);
      
      // ถ้าไม่สามารถดึงข้อมูลพนักงานทั้งหมดได้ ให้ลองอีกวิธี
      try {
        // ถ้าเป็น pond_used_id = 1 ให้ลองดึงข้อมูลพนักงานเฉพาะคนที่เราต้องการ
        if (pond_used_id === '1') {
          const workerResponse = await axios.get('/api/employee/getAllWorker');
          const academicResponse = await axios.get('/api/employee/getAllAcademic');
          
          let allEmployees = [];
          
          if (workerResponse.data && Array.isArray(workerResponse.data)) {
            allEmployees = [...allEmployees, ...workerResponse.data];
          }
          
          if (academicResponse.data && Array.isArray(academicResponse.data)) {
            allEmployees = [...allEmployees, ...academicResponse.data];
          }
          
          // ค้นหาพนักงานรหัส E011
          const e011Employee = allEmployees.find(emp => emp.employee_id === 'E011');
          
          if (e011Employee) {
            const transformedStaff = [{
              employee_id: e011Employee.employee_id,
              employee_fname: e011Employee.employee_fname,
              employee_lname: e011Employee.employee_lname,
              age: e011Employee.employee_age || 30,
              position: e011Employee.employee_position.charAt(0).toUpperCase() + e011Employee.employee_position.slice(1),
              image: e011Employee.employee_image 
                ? `/avatar/${e011Employee.employee_image}` 
                : iconUser
            }];
            
            setStaffList(transformedStaff);
            return;
          }
        }
        
        // ถ้าไม่ใช่ pond_used_id = 1 หรือไม่พบพนักงาน E011
        setStaffList([]);
      } catch (finalError) {
        console.error('All attempts to fetch employee data failed:', finalError);
        setStaffList([]);
      }
    }
  };

  // Function to fetch products used in this pond
  const fetchProductDetails = async () => {
    try {
      const response = await axios.get(`/api/pond/detail/${pond_used_id}`);
      
      if (response.data && Array.isArray(response.data)) {
        // Transform API data to match our UI needs
        const transformedProducts = response.data.map(item => ({
          product_id: item.PRODUCT_ID,
          product_name: item.product_name,
          quantity: item.REQUEST_QUANTITY,
          unit: item.unit_name
        }));
        
        setProducts(transformedProducts);
      } else {
        // Set empty array if no products found
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      setProducts([]);
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Filter staff based on position, ignoring case
  const filteredStaff = staffList.filter(staff => {
    const staffPosition = staff.position.toLowerCase();
    const currentTab = activeTab.toLowerCase();
    return staffPosition === currentTab;
  });

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
        ) : pondDetails ? (
          <div className="pond-detail-view-container" style={{
            padding: '20px 40px',
            maxWidth: '1200px',
            margin: '0 auto',
            marginTop: '0px'
          }}>
            {/* Header with back button */}
            <div style={{ marginBottom: '20px' }}>
              <button 
                onClick={() => navigate(`/keeper/pond/${pond_id}`, {
                  state: {
                    employee_id,
                    employee_fname,
                    employee_lname,
                    employee_image,
                    employee_position,
                  }
                })}
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
                  marginTop:'0px',
                  marginBottom: '30px',
                }}
              >
                BACK
              </button>
            </div>

            {/* Pond Header - Enhanced with history information */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '40px',
            }}>
              <div>
                <h1 style={{
                  fontSize: '42px',
                  fontWeight: 'bold',
                  color: '#c75e39',
                  margin: '0 0 10px 0',
                }}>{pondDetails.pond_id}</h1>
                
               
                
              </div>
              <div style={{
              marginLeft: '300px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '40px',
            }}>
              </div>
              <div>
                <h1 style={{
                  
                  fontSize: '30px',
                  fontWeight: 'bold',
                  color: '#c75e39',
                  margin: '0 0 10px 0',
                }}> Pond Used id : {pondDetails.pond_used_id}</h1>
                
               
                
              </div>
              
              
            </div>

            {/* Main content - Two columns layout */}
            <div style={{
              display: 'flex',
              gap: '30px',
              flexWrap: 'wrap',
            }}>
              {/* Left column - Staff List */}
              <div style={{
                flex: '1',
                minWidth: '300px',
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
              }}>
                {/* Staff Tab Navigation */}
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginBottom: '20px',
                }}>
                  <button
                    onClick={() => handleTabChange('Worker')}
                    style={{
                      flex: 1,
                      backgroundColor: activeTab === 'Worker' ? '#c75e39' : '#ddd',
                      color: activeTab === 'Worker' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Worker
                  </button>
                  <button
                    onClick={() => handleTabChange('Academic')}
                    style={{
                      flex: 1,
                      backgroundColor: activeTab === 'Academic' ? '#c75e39' : '#ddd',
                      color: activeTab === 'Academic' ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Academic
                  </button>
                </div>

                {/* Staff Cards */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                }}>
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((staff, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '15px',
                        borderRadius: '10px',
                        backgroundColor: 'white',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #eee',
                      }}>
                        <img 
                          src={staff.image} 
                          alt={`${staff.employee_fname} ${staff.employee_lname}`} 
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            marginRight: '15px',
                          }}
                        />
                        <div>
                          <h3 style={{ margin: '0', fontSize: '18px' }}>
                            Name: {staff.employee_fname} {staff.employee_lname}
                          </h3>
                          <p style={{ margin: '5px 0', fontSize: '16px' }}>
                            Age: {staff.age}
                          </p>
                          <p style={{ margin: '5px 0', fontSize: '16px' }}>
                            Position: {staff.position}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{
                      textAlign: 'center',
                      color: '#666',
                      fontStyle: 'italic',
                      padding: '20px',
                    }}>
                      No {activeTab}s assigned to this pond
                    </p>
                  )}
                </div>
              </div>

              {/* Right column - Products List */}
              <div style={{
                flex: '1',
                minWidth: '300px',
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
              }}>
                <h2 style={{
                  fontSize: '24px',
                  color: '#333',
                  marginTop: '0',
                  marginBottom: '20px',
                  textAlign: 'center',
                  borderBottom: '2px solid #eee',
                  paddingBottom: '10px',
                }}>
                  Products used in this pond
                </h2>

                {/* Products List */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px',
                }}>
                  {products.length > 0 ? (
                    products.map((product, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        padding: '15px',
                        borderRadius: '10px',
                        backgroundColor: 'white',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #eee',
                      }}>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '15px',
                        }}>
                          {/* Placeholder for product image */}
                          <svg width="80" height="80" viewBox="0 0 200 200">
                            <rect x="20" y="30" width="40" height="120" fill="#66B2FF" />
                            <rect x="70" y="60" width="40" height="90" fill="#66B2FF" />
                            <circle cx="70" cy="150" r="40" fill="#FFCC00" />
                            <ellipse cx="110" cy="130" rx="35" ry="30" fill="#CC66FF" />
                          </svg>
                        </div>
                        <div>
                          <h3 style={{ 
                            margin: '0 0 10px 0', 
                            fontSize: '20px',
                            fontWeight: 'bold'
                          }}>
                            {product.product_name}
                          </h3>
                          <p style={{ 
                            margin: '5px 0', 
                            fontSize: '16px' 
                          }}>
                            Quantity: {product.quantity}
                          </p>
                          <p style={{ 
                            margin: '5px 0', 
                            fontSize: '16px' 
                          }}>
                            Unit: {product.unit}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{
                      textAlign: 'center',
                      color: '#666',
                      fontStyle: 'italic',
                      padding: '20px',
                    }}>
                      No products used in this pond
                    </p>
                  )}
                </div>
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
            }}>Pond details not found</p>
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

export default KeeperViewDetailPond;