import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import ''; 
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import starIcon from '../../assets/star-dark.png';

function KeeperProduct(){
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { employee_fname, employee_lname, employee_image, employee_id, employee_position } = location.state || {};

  const [products, setProducts] = useState([]);
  const [productType, setProductType] = useState('all');
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

    const handleProductTypeChange = (e) => setProductType(e.target.value);

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

          <div className="product-list">
            {products.map((product) => (
              <div key={product.product_id} className="product-item">
                <img src={`/product/${product.product_image}`} alt={product.product_name} 
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}/>
                <h3>{product.product_name}</h3>

                <button onClick={() => navigate(`/keeper/product-detail/${product.product_id}`, {
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

}

export default KeeperProduct;
