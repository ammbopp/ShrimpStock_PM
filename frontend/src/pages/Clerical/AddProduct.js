import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';

const AddProduct = () => {
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('Food');
  const [productUnit, setProductUnit] = useState('');
  const [units, setUnits] = useState([]); // State to hold unit options
  const [productQuantity, setProductQuantity] = useState('');
  const [threshold, setThreshold] = useState('');
  const [productImage, setProductImage] = useState(null);
  const [error, setError] = useState(null);

  const location = useLocation();
  const { employee_fname, employee_lname, employee_image, employee_id, employee_position, cart } = location.state || {};

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  const navigateToPage = (path) => {
    navigate(path, { state: { employee_fname, employee_lname, employee_image, employee_id, employee_position} });
  };

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/add-product/units');
        if (!response.ok) {
          throw new Error('Failed to fetch units');
        }
        const data = await response.json();
        setUnits(data);
      } catch (error) {
        console.error('Error fetching units:', error);
      }
    };

    fetchUnits();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('product_name', productName);
    formData.append('product_type', productType);
    formData.append('product_unit', productUnit);
    formData.append('product_quantity', productQuantity);
    formData.append('threshold', threshold);
    formData.append('product_image', productImage);
  
    try {
      const response = await fetch('http://localhost:3001/api/add-product', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to add product');
      }
  
      navigate('/clerical/products');
    } catch (error) {
      console.error('Error adding product:', error);
      setError('Failed to add product. Please try again.');
    }
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
    <div className="content">
        <div className="add-product-container">
        <h2>🗒️ Add New Product</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit} className="add-product-form">
            <label> 
            Product Name:
            <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
            />
            </label>
            <label>
            Product Type:
            <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
            >
                <option value="Food">Food</option>
                <option value="Chemical">Chemical</option>
            </select>
            </label>
            <label>
            Unit:
            <select
                value={productUnit}
                onChange={(e) => setProductUnit(e.target.value)}
                required
            >
                <option value="">Select Unit</option>
                {units.map((unit) => (
                <option key={unit.unit_name} value={unit.unit_name}>
                    {unit.unit_name}
                </option>
                ))}
            </select>
            </label>
            <label>
            Quantity:
            <input
                type="number"
                value={productQuantity}
                onChange={(e) => setProductQuantity(e.target.value)}
                required
            />
            </label>
            <label>
            Threshold:
            <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                required
            />
            </label>
            <label>
            Product Image:
            <input
                type="file"
                onChange={(e) => setProductImage(e.target.files[0])}
                accept="image/*"
            />
            </label>
            <button type="submit" className="add-product-button">Add Product</button>
        </form>
        </div>
    </div>
    </div>
  );
};

export default AddProduct;
