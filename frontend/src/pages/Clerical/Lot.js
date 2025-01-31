import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import './Lot.css';

const Lot = () => {
  const location = useLocation();
  const { employee_fname, employee_lname, employee_image, employee_id } = location.state || {};
  const navigate = useNavigate();
  const [lots, setLots] = useState([]);
  const { product_id } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  useEffect(() => {
    if (product_id) {
      fetchLots();
    }
  }, [product_id]);

  const fetchLots = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/product/${product_id}/lots`);
      if (!response.ok) {
        throw new Error(`Failed to fetch lots: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setLots(data);
    } catch (error) {
      console.error('Error in fetchLots:', error);
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navigateToPage = (path) => {
    navigate(path, { state: { employee_fname, employee_lname, employee_image, employee_id } });
  };

  const handleViewDetail = (lot_id) => {
    navigate(`/clerical/lot-detail/${lot_id}`, {
        state: {
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

      <div className="content">
        <h1>Lots for Product ID: {product_id}</h1>
        <div className="lot-cards-container">
          {lots.map((lot) => (
            <div key={lot.lot_id} className="lot-card">
              <p><strong>Lot ID:</strong> {lot.lot_id}</p>
              <p><strong>Date:</strong> {new Date(lot.lot_date).toLocaleDateString()}</p>
              <p><strong>Expiration Date:</strong> {new Date(lot.lot_exp).toLocaleDateString()}</p>
              <p><strong>Quantity:</strong> {lot.lot_quantity}</p>
              <button onClick={() => handleViewDetail(lot.lot_id)} className="view-button">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lot;
