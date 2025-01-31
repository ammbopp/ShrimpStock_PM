import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import './Audit.css';

const Audit = () => {
  const location = useLocation();
  const { employee_fname, employee_lname, employee_image, employee_id } = location.state || {};
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  const [latestAudit, setLatestAudit] = useState(null);
  const [allAudits, setAllAudits] = useState([]);
  const [currentAudit, setCurrentAudit] = useState(null);
  const [currentAuditLists, setCurrentAuditLists] = useState([]);
  const [totalAuditAmount, setTotalAuditAmount] = useState(0);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navigateToPage = (path) => {
    navigate(path, { state: { employee_fname, employee_lname, employee_image, employee_id } });
  };

  useEffect(() => {
    fetchLatestAudit();
    fetchAllAudits();
    fetchTotalAuditAmount();
  }, []);

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
      fetchAuditDetails(data.audit_id); // Fetch details for the latest audit
    } catch (error) {
      console.error('Error fetching latest audit:', error);
    }
  };
  
  const fetchAuditDetails = async (audit_id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/audits/${audit_id}`); // Match the backend route
      if (!response.ok) {
        throw new Error('Failed to fetch audit details');
      }
      const data = await response.json();
      console.log(`Fetched audit details for ${audit_id}:`, data); // Debugging log
      setCurrentAudit(data.audit);
      setCurrentAuditLists(data.auditLists);
    } catch (error) {
      console.error('Error fetching audit details:', error);
    }
  };
  
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
          {currentAudit && (
            <div className="audit-card">
              <h2>Audit ID: {currentAudit.audit_id}</h2>
              <p><strong>Payment Due Date:</strong> {new Date(currentAudit.payment_due_date).toLocaleString()}</p>
              <p><strong>Payment Status:</strong> {currentAudit.payment_status ? 'Paid' : 'Pending'}</p>
              <p><strong>Total Amount of Current Audit:</strong> {totalAuditAmount} THB</p>
              <div className='toolbar2'>
              {!currentAudit.payment_status && new Date() >= new Date(currentAudit.payment_due_date) && (
                <button className="view-button" onClick={() => confirmPayment(currentAudit.audit_id)}>
                  Confirm Payment
                </button>
              )}
                {latestAudit && (
                  <button className="view-button" onClick={() => navigate(`/clerical/add-orders/${latestAudit.audit_id}`)}>
                    Add Orders to Audit
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="audit-selector">
            <label>Select Audit Round:</label>
            <select onChange={(e) => handleAuditChange(e.target.value)}>
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
                  <button onClick={()=> navigateToDetail(item.order_id)}>View Detail</button>
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
