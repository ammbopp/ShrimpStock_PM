import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import './RequestHistory.css';
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';

const Order = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { employee_fname, employee_lname, employee_image, employee_id } = location.state || {};

  const [statusFilter, setStatusFilter] = useState('waiting');
  const [sortOrder, setSortOrder] = useState('desc');
  const [orders, setOrders] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

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

  const navigateToDetail = (orders) => {
    navigate(`/clerical/order-detail/${orders.order_id}`, {
      state: {
        order_id: orders.order_id,
        request_date: orders.order_date,
        request_status: orders.order_status,
        employee_fname,
        employee_lname,
        employee_image,
        employee_id,
      },
    });
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const query = `http://localhost:3001/api/orders?status=${statusFilter}&order=${sortOrder}`;
  
        const response = await fetch(query);
  
        if (response.ok) {
          const data = await response.json();
          setOrders(data); // เปลี่ยนชื่อจาก setRequests เป็น setOrders หรือใช้ setRequests หากยังต้องการใช้ชื่อเดิม
        } else {
          console.error('Error fetching order history:', response.status);
        }
      } catch (error) {
        console.error('Network or server error:', error);
      }
    }; 
    fetchOrders();
  }, [statusFilter, sortOrder]);
  

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setSortOrder(e.target.value);
  };

  return (
    <div className="page-container">
      {/* Side menu */}
      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li onClick={() => navigateToPage('/clerical/home')}>Home</li>
          <li onClick={() => navigateToPage('/clerical/profile')}>Profile</li>
          <li onClick={() => navigateToPage('/clerical/products')}>Products</li>
          <li onClick={() => navigateToPage('/clerical/requests')}>Requests</li>
          <li onClick={() => navigateToPage('/clerical/orders')}>Orders</li>
          <li onClick={() => navigateToPage('/clerical/audit')}>Audits</li>
          <li onClick={() => navigateToPage('/login')}>Logout</li>
        </ul>
      </div>

      {/* Main content */}
      <div className="content">
        <div className="navbar" style={{position: 'fixed', top: 0, left: 0, right: 0, width: '60%'}}>
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

        <h1>Order History for {employee_fname} {employee_lname} 📋</h1>
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
        {orders.length > 0 ? (
            orders.map((order, index) => (
            <div key={`${order.order_id}-${index}`} className="request-card">
                <div className="request-info">
                <p><strong>📍 Order ID:</strong> {order.order_id}</p>
                <p><strong>Date:</strong> {new Date(order.order_date).toLocaleDateString()}</p>
                </div>
                <div className="request-status">
                <span className={`status ${order.order_status.toLowerCase()}`}>
                    {order.order_status}
                </span>
                <button className="view-details-button" onClick={() => navigateToDetail(order)}>View Details</button>
                </div>
            </div>
            ))
        ) : (
            <p>No orders found</p>
        )}
        </div>

      </div>
    </div>
  );
};

export default Order;


