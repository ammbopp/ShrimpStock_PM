import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RequestMenu.css';
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import cartIcon from '../../assets/cart.png';
import starIcon from '../../assets/star-dark.png';

const RequestMenu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { employee_fname, employee_lname, employee_image, employee_id, employee_position, cart } = location.state || {};

  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);

  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  useEffect(() => {
    // ดึงข้อมูลสินค้าจาก Backend เมื่อ Component ถูก mount
    fetch('http://localhost:3001/api/products/chemical')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setProducts(data))
      .catch(error => console.error('Error fetching products:', error));
  }, []);
  
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navigateToPage = (path) => {
    console.log('Navigating to:', path);
    console.log('State:', {
      employee_fname,
      employee_lname,
      employee_image,
      employee_id,
      employee_position,
      cart,
    });
  
    navigate(path, {
      state: {
        employee_fname,
        employee_lname,
        employee_image,
        employee_id,
        employee_position,
        cart,
      },
    });
  };
  
  return (
    <div>
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
      <div className="content" style={{ marginTop: '150px' }}>
        <h1>Hey, <span id="username">{employee_fname || 'Guest'} {employee_lname || ''}</span>
        <br></br> Let's choose your Chemical! 👀</h1>
        <hr />

        <div className="notice-card">
          <h2 className="notice-title">
            <div className="notice-left">
                <img src={starIcon} alt="Star Icon" className="notice-icon" />
                <span>🧫 Request Menu : Chemical</span>
            </div>
          </h2>
          <div className="product-list">
            {/* แสดงสินค้าที่ดึงมาจาก Backend */}
            {products.map((product) => (
              <div key={product.product_id} className="product-item">
                {/* ใช้ public เพื่อแสดงรูปภาพ */}
                <img src={`/product/${product.product_image}`} alt={product.product_name} 
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}/>
                <h3>{product.product_name}</h3>
                <button onClick={() => navigate(`/academic/chem-detail`, {
                    state: {
                        product_id: product.product_id,
                        product_name: product.product_name,
                        product_image: product.product_image,

                        employee_fname,
                        employee_lname,
                        employee_image,
                        employee_id,
                        employee_position,
                        cart,
                    },
                  
                    })}style={{ marginTop: '5px' }}>View Details</button>
              </div>
            ))}
          </div>
        </div>
      </div>
     
      {/* Cart icon at bottom right */}
      <div className="cart-icon" onClick={() => navigateToPage('/academic/cart')}>
        <img src={cartIcon} alt="Cart Icon" />
        <span className="cart-count">{cart?.length || 0}</span>
      </div>
    </div>
  );
};

export default RequestMenu;
