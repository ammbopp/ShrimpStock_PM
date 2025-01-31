import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import starIcon from '../../assets/star-dark.png';
import './Product.css';

const Product = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { employee_fname, employee_lname, employee_image, employee_id, employee_position, cart } = location.state || {};

  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [productType, setProductType] = useState('all'); // Filter state

  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  useEffect(() => {
    const fetchProducts = async () => {
      const query = productType !== 'all' ? `?product_type=${productType}` : '';
      const response = await fetch(`http://localhost:3001/api/products${query}`);
      
      if (!response.ok) {
        console.error('Error fetching products:', response.statusText);
        return;
      }
      
      const data = await response.json();
      setProducts(data);
    };

    fetchProducts();
  }, [productType]);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const navigateToPage = (path) => {
    navigate(path, { state: { employee_fname, employee_lname, employee_image, employee_id, employee_position} });
  };

  const handleProductTypeChange = (e) => setProductType(e.target.value);

  const navigateToAddProduct = () => {
    navigate('/clerical/add-product', { 
      state: { employee_fname, employee_lname, employee_image, employee_id, employee_position } 
    });
  };

  return (
    <div className="page-container">
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
          <li onClick={() => navigateToPage('/clerical/home')}>Home</li>
          <li onClick={() => navigateToPage('/clerical/profile')}>Profile</li>
          <li onClick={() => navigateToPage('/clerical/products')}>Products</li>
          <li onClick={() => navigateToPage('/clerical/requests')}>Requests</li>
          <li onClick={() => navigateToPage('/clerical/orders')}>Orders</li>
          <li onClick={() => navigateToPage('/clerical/audit')}>Audits</li>
          <li onClick={() => navigateToPage('/login')}>Logout</li>
        </ul>
      </div>

      {/* Main content */}
      <div className="content" >
        <h1>Hey, <span id="username">{employee_fname || 'Guest'} {employee_lname || ''}</span> let's check stock! 👀</h1>
        <hr />

        <div className="notice-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="notice-left">
              <img src={starIcon} alt="Star Icon" className="notice-icon" />
              <span>
                {productType === 'all' && '📦 Products: All'}
                {productType === 'Food' && '🧀 Products: Food'}
                {productType === 'Chemical' && '🧪 Products: Chemical'}
              </span>
            </div>
            <div className="filters1">
              <label>Filter by Type:</label>
              <select onChange={handleProductTypeChange} value={productType}>
                <option value="all">All</option>
                <option value="Food">Food</option>
                <option value="Chemical">Chemical</option>
              </select>
            </div>
          </div>
          <div className='toolbar'>
            <button onClick={navigateToAddProduct} className="add-product-button1">
                + Add New Product
            </button>
          </div>

          <div className="product-list">
            {products.map((product) => (
              <div key={product.product_id} className="product-item">
                <img src={`/product/${product.product_image}`} alt={product.product_name} 
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}/>
                <h3>{product.product_name}</h3>

                <button onClick={() => navigate(`/clerical/product-detail/${product.product_id}`, {
                    state: {
                        product_id: product.product_id,
                        product_name: product.product_name,
                        product_image: product.product_image,
                        employee_fname,
                        employee_lname,
                        employee_image,
                        employee_id,
                        employee_position,
                    },
                  
                    })} style={{ marginTop: '5px' }}>View Details</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
