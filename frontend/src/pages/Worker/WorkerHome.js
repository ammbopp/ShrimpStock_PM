import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './WorkerHome.css'; // ใช้ไฟล์ CSS นี้สำหรับการตกแต่งที่เหมือนกับหน้า RequestHistory
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import starIcon from '../../assets/star-dark.png';

function WorkerHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { employee_fname, employee_lname, employee_image, employee_id, employee_position } = location.state || {};

  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

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
    console.log('Employee ID:', employee_id);
  };

  const navigateToDetail = (request) => {
    // นำทางไปหน้า RequestDetail และส่งข้อมูล request_id
    navigate('/worker/request-detail', {
      state: {
        request_id: request.request_id,
        request_date: request.request_date,
        request_status: request.request_status,
        employee_fname,
        employee_lname,
        employee_image,
        employee_id,
      },  
    });
    console.log(request);
  };

  useEffect(() => {
    const fetchAcceptedRequests = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/home/requests/accept/${employee_id}`);
        if (response.ok) {
          const data = await response.json();
          setRequests(data);
        } else {
          console.error('Error fetching accepted requests');
        }
      } catch (error) {
        console.error('Error fetching accepted requests:', error);
      }
    };
  
    if (employee_id) {
      fetchAcceptedRequests();
    }
  }, [employee_id]);
  

  return (
    <div className="page-container">
      {/* Side Menu */}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li onClick={() => navigateToPage('/worker/home')}>Home</li>
          <li onClick={() => navigateToPage('/worker/profile')}>Profile</li>
          <li onClick={() => navigateToPage('/worker/requests/:employee_id')}>Request History</li>
          <li onClick={() => navigateToPage('/worker/request-menu')}>Product Request</li>
          <li onClick={() => navigateToPage('/login')}>Logout</li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="content">
        {/* Navbar */}
        <div className="navbar">
          <div className="logo">
            <img src={shrimpLogo} alt="Shrimp Logo" />
            <button className="menu-button" onClick={toggleMenu}>
              <span className="menu-icon">&#9776;</span>
            </button>
            <span>Shrimp Farm</span>
          </div>
          <div className="user-profile">
            <img src={employeeImagePath} alt="User Profile" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          </div>
        </div>

        {/* Content Body */}
        <h1>Welcome, <span id="username">{employee_fname || 'Guest'} {employee_lname || ''}</span> to Worker Dashboard 👩🏻‍🌾</h1>
        <hr />
        <div className="notice-card">
          <h2 className="notice-title">
            <div className="notice-left">
              <img src={starIcon} alt="Star Icon" className="notice-icon" />
              <span>Notice : ใบเบิกล่าสุด</span>
            </div>
            <span className="view-all" style={{ cursor: 'pointer', color: '#BD5D3A' }} onClick={() => navigateToPage('/worker/requests/:employee_id')}>view all</span>
          </h2>
          <div className="request-list">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div key={request.request_id} className="request-card">
                  <div className="request-info">
                    <p><strong>📍 Request ID:</strong> {request.request_id}</p>
                    <p><strong>Date:</strong> {new Date(request.request_date).toLocaleDateString()}</p>
                  </div>
                  <div className="request-status">
                    <p className={`status ${request.request_status.toLowerCase()}`}>{request.request_status}</p>
                    <button className="view-details-button" onClick={() => navigateToDetail(request)}>View Details</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No recent accepted requests found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkerHome;
