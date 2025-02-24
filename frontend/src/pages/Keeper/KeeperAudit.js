import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import ''; 
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import starIcon from '../../assets/star-dark.png';

function KeeperAudit(){
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

  return (
    <div className="page-container">
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
        
        
      </div>
    </div>
  );

}

export default KeeperAudit;
