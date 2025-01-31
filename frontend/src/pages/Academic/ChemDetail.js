import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ChemDetail.css'; 
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import cartIcon from '../../assets/cart.png';

const ChemDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product_id, product_name, product_image
        , employee_fname, employee_lname, employee_image, employee_id,
        employee_position, cart } = location.state || {};
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('');
  const [units, setUnits] = useState([]); // สร้าง state สำหรับเก็บ units

  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  // ดึงข้อมูล Units เมื่อ component ถูก mount
  useEffect(() => {
    fetch('http://localhost:3001/api/units/chem')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setUnits(data))
      .catch(error => console.error('Error fetching units:', error));
  }, []);

  const handleAddToCart = () => {
    const newProduct = {
      product_id,
      product_name,
      product_image,
      quantity,
      unit,
    };

    const updatedCart = [...(cart || []), newProduct];
    navigate('/academic/cart', {
      state: {
        cart: updatedCart,
        employee_fname,
        employee_lname,
        employee_image,
        employee_id
      },
    });
  };

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
        cart,
      },
    });
  };

  return (
    <div>
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
      <div className="content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '80px' }}>
        <div className="product-detail-card">
          <img src={`/product/${product_image}`} alt={product_name} className="product-detail-img" />
          <h1>{product_name}</h1>
          <p className="product-description"></p>

          <div className="quantity-select">
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              min="1"
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          <div className="unit-select">
            <label htmlFor="unit">Unit:</label>
            <select id="unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="" disabled>Select Unit</option>
              {units.map((unit) => (
                <option key={unit.unit_id} value={unit.unit_name}>
                  {unit.unit_name}
                </option>
              ))}
            </select>
          </div>

          <button onClick={handleAddToCart} className="add-to-cart-button">Add to Cart</button>
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

export default ChemDetail;
