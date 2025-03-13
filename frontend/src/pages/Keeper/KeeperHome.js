import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import ''; 
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import starIcon from '../../assets/star-dark.png';

function KeeperHome(){
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState({});
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

  const navigateToOrder = (product) => {
    navigate(`/keeper/detail-order/${product.product_id}`, {
      state: {
        product_id: product.product_id,
        product_name: product.product_name,
        product_image: product.product_image,
        employee_fname,
        employee_lname,
        employee_image,
        employee_id,
      },  
    });
    console.log(product);
  };

  useEffect(() => {
    const fetchProductOutOfStock = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/products/all`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          console.error('Error fetching product');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };
  
    fetchProductOutOfStock();
  }, []); // เพิ่ม [] เพื่อให้ useEffect ทำงานแค่ครั้งเดียว
  
  
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
        <h1>Welcome, <span id="username">{employee_fname || 'Guest'} {employee_lname || ''}</span> to Keeper Dashboard 👩🏻‍💼</h1>
        <hr />
        <div className="notice-card">
          <h2 className="notice-title">
            <div className="notice-left">
              <img src={starIcon} alt="Star Icon" className="notice-icon" />
              <span>Notice : Product out of stock</span>
            </div>
            <span className="view-all" style={{ cursor: 'pointer', color: '#BD5D3A' }}>view all</span>
          </h2>
          <div className="request-list">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.product_id} className="request-card">
                  <div style={{ display: 'flex', gap: '10px'}}>
                  <img src={`/product/${product.product_image}`} alt={product.product_name} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                    <div className="request-info" style={{ gap: '10px', marginTop: 'auto', marginBottom:'auto'}}>
                      <h3><strong>📍 Product:</strong> {product.product_name}</h3>
                      <h3><strong>Type:</strong> {product.product_type}</h3>
                    </div>
                    </div>
                  <div className="request-status">

                    <button className="view-details-button" onClick={() => navigateToOrder(product)}>Add to cart</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No recent waiting requests found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

}

export default KeeperHome;
