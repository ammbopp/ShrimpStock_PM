import React, { useState, useEffect } from 'react';
import { useLocation,useParams, useNavigate } from 'react-router-dom';
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import './Lot.css';

const LotDetail = () => {
  const { lot_id } = useParams();
  const navigate = useNavigate();

  const location = useLocation();
  const { employee_fname, employee_lname, employee_image, employee_id } = location.state || {};
  const [lotDetail, setLotDetail] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [error, setError] = useState(null);

  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const fetchLotDetail = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/lot-detail/${lot_id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch lot detail: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setLotDetail(data);
      } catch (error) {
        console.error('Error fetching lot detail:', error);
        setError('Unable to load lot details. Please try again later.');
      }
    };

    fetchLotDetail();
  }, [lot_id]);

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

      <div className="navbar" style={{ position: 'fixed', top: 0, left: 0, right: 0, width: '60%' }}>
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

      <div className="content" style={{ marginTop: '60px', padding: '20px' }}>
        {error ? (
          <p className="error-message">{error}</p>
        ) : lotDetail ? (
          <div className="product-detail-card">
            <img src={`/product/${lotDetail.product_image}`} alt={lotDetail.product_name} className="product-image" />
            <h2>{lotDetail.product_name}</h2>
            <h2><strong>Lot:</strong> {lotDetail.lot_id}</h2>
            <p><strong>Product Type:</strong> {lotDetail.product_type}</p>
            <p><strong>Product Unit:</strong> {lotDetail.product_unit}</p>
            <p><strong>Date:</strong> {new Date(lotDetail.lot_date).toLocaleDateString()}</p>
            <p><strong>Expiration Date:</strong> {new Date(lotDetail.lot_exp).toLocaleDateString()}</p>
            <p><strong>Quantity:</strong> {lotDetail.lot_quantity}</p>
            <button onClick={() => navigate(-1)} className="back-button">Go Back</button>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default LotDetail;
