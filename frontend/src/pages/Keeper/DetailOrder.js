import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import cartIcon from '../../assets/cart.png';

const DetailOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    product_id, 
    product_name, 
    product_image, 
    employee_fname, 
    employee_lname, 
    employee_image, 
    employee_id, 
    employee_position, 
    cart = [] 
  } = location.state || {};

  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('');
  const [units, setUnits] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  useEffect(() => {
    if (product_id) {
      fetch(`http://localhost:3001/api/product-detail/${product_id}`)
        .then(response => response.json())
        .then(data => {
          setProduct(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching product details:', error);
          setLoading(false);
        });
    }
  }, [product_id]);

  useEffect(() => {
    if (product && product.product_type) {
      const unitType = product.product_type === 'Food' ? 'food' : 'chem';
      fetch(`http://localhost:3001/api/units/${unitType}`)
        .then(response => response.json())
        .then(data => setUnits(data))
        .catch(error => console.error('Error fetching units:', error));
    }
  }, [product]);

  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(savedCart.length);
    };

    updateCartCount();
    
    window.addEventListener('storage', updateCartCount);
    
    return () => {
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  const handleAddToCart = () => {
    if (!unit) {
      alert("Please select a unit before adding to cart.");
      return;
    }

    const newProduct = {
      product_id,
      product_name,
      product_image,
      quantity,
      unit,
    };

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    const updatedCart = [...existingCart, newProduct];

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setCartCount(updatedCart.length);

    navigate('/keeper/cart', {
      state: {
        cart: updatedCart, 
        employee_fname,
        employee_lname,
        employee_image,
        employee_id,
        employee_position,
      },
    });
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

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

  const navigateToCart = () => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    navigate('/keeper/cart', { 
      state: { 
        employee_fname, 
        employee_lname, 
        employee_image, 
        employee_id, 
        employee_position, 
        cart: savedCart 
      } 
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

      {/* Main content */}
      <div className="content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '80px' }}>
        <div className="product-detail-card">
          <img src={`/product/${product_image}`} alt={product_name} className="product-detail-img" />
          <h1>{product_name}</h1>

          <div className="quantity-select">
            <label htmlFor="quantity">Quantity:</label>
            <input type="number" id="quantity" value={quantity} min="1" onChange={(e) => setQuantity(Number(e.target.value))} />
          </div>

          <div className="unit-select">
            <label htmlFor="unit">Unit:</label>
            <select id="unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
              <option value="" disabled>Select Unit</option>
              {units.map((unitItem) => (
                <option key={unitItem.unit_id} value={unitItem.unit_name}>{unitItem.unit_name}</option>
              ))}
            </select>
          </div>

          <button onClick={handleAddToCart} className="add-to-cart-button">Add to Cart</button>
        </div>
      </div>

      {/* Cart icon */}
      <div className="cart-icon" onClick={navigateToCart}>
        <img src={cartIcon} alt="Cart Icon" />
        <span className="cart-count">{cartCount}</span>
      </div>
    </div>
  );
};

export default DetailOrder;