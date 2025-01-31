import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';

const ProductDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product_id } = useParams();
  const { employee_fname, employee_lname, employee_image, employee_id, employee_position } = location.state || {};

  const [productDetail, setProductDetail] = useState({});
  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

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

  useEffect(() => {
    const fetchProductDetail = async () => {
      const response = await fetch(`http://localhost:3001/api/product-detail/${product_id}`);
      
      if (!response.ok) {
        console.error('Error fetching product details:', response.statusText);
        return;
      }
      
      const data = await response.json();
      setProductDetail(data);
    };

    fetchProductDetail();
  }, [product_id]);

  const navigateToLots = () => {
    navigate(`/clerical/lots/${product_id}`, {
      state: {
        product_id,
        employee_fname,
        employee_lname,
        employee_image,
        employee_id,
        employee_position,
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
      <div className="navbar" style={{position: 'fixed', top: 0, left: 0, right: 0, width: '60%'}}>
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

      <div className="content" style={{ marginTop: '60px', padding: '20px' }}>
        <div className="product-detail-card">
          <img src={`/product/${productDetail.product_image}`} alt={productDetail.product_name}/>
          
          <h2 >{productDetail.product_name}</h2>
          <p><strong>Product Type:</strong> {productDetail.product_type}</p>
          <p><strong>Unit:</strong> {productDetail.product_unit}</p>
          <p><strong>Quantity in Stock:</strong> {productDetail.product_quantity}</p>
          <p><strong>Threshold:</strong> {productDetail.threshold}</p>

          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button className="view-button" onClick={navigateToLots} >
              View All Lots
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
