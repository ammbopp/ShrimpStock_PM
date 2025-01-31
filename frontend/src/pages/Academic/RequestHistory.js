import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import './RequestHistory.css';
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';

const RequestHistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { employee_fname, employee_lname, employee_image, employee_id } = location.state || {};

  const [statusFilter, setStatusFilter] = useState('all');  // all, waiting, accept, reject, done
  const [sortOrder, setSortOrder] = useState('desc');  // desc, asc
  const [requests, setRequests] = useState([]);

  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const [menuOpen, setMenuOpen] = useState(false);

  const navigateToPage = (path) => {
    navigate(path, {
      state: {
        employee_fname,
        employee_lname,
        employee_image,
        employee_id,
      },
    });
  };

  const navigateToDetail = (request) => {
    navigate('/academic/request-detail', {
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
    const fetchRequests = async () => {
      const query = `http://localhost:3001/api/requests/${employee_id}?status=${statusFilter === 'all' ? '' : statusFilter}&order=${sortOrder}`;
      
      console.log('Request URL:', query);
      
      const response = await fetch(query);
      const data = await response.json();
      
      if (response.ok) {
        setRequests(data);
      } else {
        console.error('Error fetching request history:', data);
      }
    };
    
    fetchRequests();
  }, [statusFilter, sortOrder, employee_id]);

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  return (
    <div className="page-container">
      {/* Navbar */}
      <div className="navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, width: '60%', zIndex: 1000, backgroundColor: '#FFFFFF', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)' }}>
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
      
      {/* Side menu */}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li onClick={() => navigateToPage('/academic/home')}>Home</li>
          <li onClick={() => navigateToPage('/academic/profile')}>Profile</li>
          <li onClick={() => navigateToPage('/academic/requests/:employee_id')}>Request History</li>
          <li onClick={() => navigateToPage('/academic/request-menu')}>Request Menu</li>
          <li onClick={() => navigate('/login')}>Logout</li>
        </ul>
      </div>
      
      {/* Main content */}
      <div className="content">
        <h1>Request History for {employee_fname} {employee_lname} 📋</h1>
        <hr />
        
        {/* Filter and Sort Controls */}
        <div className="filters">
          <label>Status:</label>
          <select onChange={handleStatusChange} value={statusFilter}>
            <option value="all">All</option>
            <option value="waiting">Waiting</option>
            <option value="accept">Accepted</option>
            <option value="reject">Rejected</option>
            <option value="done">Done</option>
          </select>

          <label>Sort Order:</label>
          <select onChange={handleSortOrderChange} value={sortOrder}>
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* Request List */}
        <div className="request-list">
          {requests.length > 0 ? (
            requests.map((request) => (
              <div key={request.request_id} className="request-card">
                <div className="request-info">
                  <p><strong>📍 Request ID:</strong> {request.request_id}</p>
                  <p><strong>Date:</strong> {new Date(request.request_date).toLocaleDateString()}</p>
                </div>
                <div className="request-status">
                  <span className={`status ${request.request_status.toLowerCase()}`}>
                    {request.request_status}
                  </span>
                  <button className="view-details-button" onClick={() => navigateToDetail(request)}>View Details</button>
                </div>
              </div>
            ))
          ) : (
            <p>No requests found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestHistory;
