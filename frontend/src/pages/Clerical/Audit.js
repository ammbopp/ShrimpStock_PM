import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import './Audit.css';

// Notification component
const AuditNotification = ({ audit, onConfirmPayment }) => {
  if (!audit || audit.payment_status || new Date() < new Date(audit.payment_due_date)) {
    return null;
  }

  return (
    <div className="notification-container">
      <div className="notification-text">
        <span>Notification :</span>
        <span>It's time to pay Audit ID: {audit.audit_id}</span>
      </div>
      <button
        className="notification-button"
        onClick={() => onConfirmPayment(audit.audit_id)}
      >
        Payment completed
      </button>
    </div>
  );
};

const Audit = () => {
  const location = useLocation();
  const { employee_fname, employee_lname, employee_image, employee_id } = location.state || {};
  const { audit_id } = location.state || {};
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  const [latestAudit, setLatestAudit] = useState(null);
  const [allAudits, setAllAudits] = useState([]);
  const [currentAudit, setCurrentAudit] = useState(null);
  const [currentAuditLists, setCurrentAuditLists] = useState([]);
  const [totalAuditAmount, setTotalAuditAmount] = useState(0);
  const [selectedAuditId, setSelectedAuditId] = useState('');

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navigateToPage = (path) => {
    navigate(path, { state: { employee_fname, employee_lname, employee_image, employee_id } });
  };

  // Fetch all audits first
  useEffect(() => {
    fetchAllAudits();
    fetchTotalAuditAmount();
  }, []);

  // After fetching all audits, set up the current audit
  useEffect(() => {
    if (allAudits.length > 0) {
      // check if state is passed from the previous page
      if (audit_id) {
        handleAuditChange(audit_id);
        setSelectedAuditId(audit_id);
      } else {
        fetchLatestAudit();
      }
    } else {
      fetchLatestAudit();
    }
  }, [allAudits, audit_id]);

  const fetchAllAudits = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/audits'); // Match the backend route
      if (!response.ok) {
        throw new Error('Failed to fetch all audits');
      }
      const data = await response.json();
      console.log('Fetched all audits:', data); // Debugging log
      setAllAudits(data);
    } catch (error) {
      console.error('Error fetching all audits:', error);
    }
  };

  const fetchLatestAudit = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/audits/latest'); // Match the backend route
      if (!response.ok) {
        throw new Error('Failed to fetch the latest audit');
      }
      const data = await response.json();
      console.log('Fetched latest audit:', data); // Debugging log
      setLatestAudit(data);
      setSelectedAuditId(data.audit_id); // Set the selected audit ID
      fetchAuditDetails(data.audit_id); // Fetch details for the latest audit
    } catch (error) {
      console.error('Error fetching latest audit:', error);
    }
  };

  const fetchAuditDetails = useCallback(async (audit_id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/audits/${audit_id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch audit details');
      }
      const data = await response.json();
      console.log(`Fetched audit details for ${audit_id}:`, data);
      setCurrentAudit(data.audit);
      setCurrentAuditLists(data.auditLists);

      // Calculate total amount for the current audit
      const total = data.auditLists.reduce((sum, item) => sum + parseFloat(item.order_amount || 0), 0);
      setTotalAuditAmount(total);
    } catch (error) {
      console.error('Error fetching audit details:', error);
    }
  }, []);


  const confirmPayment = async (audit_id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/audits/${audit_id}/confirm-payment`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to confirm payment');
      }
      fetchAuditDetails(audit_id);
    } catch (error) {
      console.error('Error confirming payment:', error);
    }
  };

  const fetchTotalAuditAmount = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/audits/latest/total');
      const data = await response.json();
      setTotalAuditAmount(data.total || 0);
    } catch (error) {
      console.error('Error fetching total audit amount:', error);
    }
  };

  const handleAuditChange = (audit_id) => {
    setSelectedAuditId(audit_id);
    fetchAuditDetails(audit_id);
  };


  const navigateToDetail = (order_id) => {
    navigate(`/clerical/order-detail/${order_id}`, {
      state: {
        order_id,
        employee_fname,
        employee_lname,
        employee_image,
        employee_id,
      },
    });
  };

  return (
    <div className="page-container">
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

      <div className="navbar">
        <div className="logo">
          <img src={shrimpLogo} alt="Shrimp Logo" />
          <button className="menu-button" onClick={toggleMenu}>
            <span className="menu-icon">&#9776;</span>
          </button>
          <span>Shrimp Farm</span>
        </div>
        <div className="user-profile">
          <img src={employeeImagePath} alt="User Profile" className="profile-image" />
        </div>
      </div>
      <div className='content'>
        <h1>Audit Details</h1>
        <AuditNotification audit={currentAudit} onConfirmPayment={confirmPayment} />
        {currentAudit && (
          <div className="audit-card">
            <h2>Audit ID: {currentAudit.audit_id}</h2>
            <p><strong>Payment Due Date:</strong> {new Date(currentAudit.payment_due_date).toLocaleString()}</p>
            <p><strong>Payment Status:</strong> {currentAudit.payment_status ? 'Paid' : 'Pending'}</p>
            <p><strong>Total Amount:</strong> {totalAuditAmount.toFixed(2)} THB</p>
            <div className='toolbar2'>
              {new Date() < new Date(currentAudit.payment_due_date) && (
                <button className="view-button" onClick={() => navigate(`/clerical/add-orders/${latestAudit.audit_id}`)}>
                  Add Orders to Audit
                </button>
              )}
            </div>
          </div>
        )}


        <div className="audit-selector">
          <label>Select Audit Round:</label>
          <select
            value={selectedAuditId}
            onChange={(e) => handleAuditChange(e.target.value)}
          >
            {allAudits.map((audit) => (
              <option key={audit.audit_id} value={audit.audit_id}>
                {audit.audit_id} - {new Date(audit.payment_due_date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>


        <div className="audit-list">
          <h3>Audit List</h3>
          {currentAuditLists.length > 0 ? (
            currentAuditLists.map((item) => (
              <div key={item.audit_list_id} className="audit-list-card">
                <p><strong>Order ID:</strong> {item.order_id}</p>
                <p><strong>Order Amount:</strong> {item.order_amount}</p>
                <button onClick={() => navigateToDetail(item.order_id)}>View Detail</button>
              </div>
            ))
          ) : (
            <p>No audit list items available</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default Audit;