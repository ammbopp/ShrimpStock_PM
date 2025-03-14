import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import ''; 
import './CleriaHome.css';
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import starIcon from '../../assets/star-dark.png';

function CleriaHome() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [payments, setPendingPayments] = useState([]);
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
    navigate('/clerical/request-detail', {
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

  const navigateToPaymentDetail = (payment) => {
    // Navigate to the payment detail page and pass the payment data
    navigate('/clerical/audit', {
      state: {
        audit_id: payment.audit_id,
        employee_fname,
        employee_lname,
        employee_image,
        employee_id,
      },
    });
    console.log(payment);
  };

  useEffect(() => {
    const fetchWaitingRequests = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/home/clerical/requests/waiting`);
        if (response.ok) {
          const data = await response.json();
          setRequests(data);
        } else {
          console.error('Error fetching waiting requests');
        }
      } catch (error) {
        console.error('Error fetching waiting requests:', error);
      }
    };

    fetchWaitingRequests();
  }, []); // เพิ่ม [] เพื่อให้ useEffect ทำงานแค่ครั้งเดียว

  // pulls data from audits on page load once, choosing only payment_status of 0
  useEffect(() => {
    const fetchPendingPayments = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/home/clerical/audits/waiting');
        if (response.ok) {
          const data = await response.json();
          setPendingPayments(data);
        } else {
          console.error('Error fetching pending payments');
        }
      } catch (error) {
        console.error('Error fetching pending payments:', error);
      }
    };

    fetchPendingPayments();
  }, []);

  return (
    <div className="page-container">
      {/* Side Menu */}
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
        <div>
          <h1>Welcome, <span id="username">{employee_fname || 'Guest'} {employee_lname || ''}</span> to Clerical Dashboard 👩🏼‍🏫</h1>
          <hr />
          <div className="notice-card">
            <h2 className="notice-title">
              <div className="notice-left">
                <img src={starIcon} alt="Star Icon" className="notice-icon" />
                <span>Notice : ใบเบิกล่าสุด</span>
              </div>
              <span className="view-all" style={{ cursor: 'pointer', color: '#BD5D3A' }} onClick={() => navigateToPage('/clerical/requests')}>view all</span>
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
                <p>No recent waiting requests found.</p>
              )}
            </div>
          </div>
        </div>

        <div className="payments">
          <h1>Pending Payments</h1>
          <hr />
          <div className="payments-list">
            {payments.length > 0 ? (
              payments.map((payment) => (
                <div key={payment.audit_id} className="payments-card">
                  <div className="payments-info">
                    <p><strong>📍 Request ID:</strong> {payment.audit_id}</p>
                    <p><strong>Date:</strong> {new Date(payment.payment_due_date).toLocaleDateString()}</p>
                    <p><strong>Total Amount:</strong> {payment.total_order_amount} THB</p>
                    <p><strong>Payment Due Date:</strong> {new Date(payment.payment_due_date).toLocaleDateString()}</p>
                  </div>
                  <div className="payment-action">
                    <p className="payments-status">
                      <strong>Status</strong>
                      {new Date() > new Date(payment.payment_due_date) ? 'Overdue' : 'Pending'}
                    </p>
                    <button className="view-details-button" onClick={() => navigateToPaymentDetail(payment)}>
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No recent pending payments.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

}

export default CleriaHome;
