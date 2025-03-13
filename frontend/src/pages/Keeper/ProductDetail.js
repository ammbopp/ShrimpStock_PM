import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import shrimpLogo from '../../assets/shrimp.png';
import iconUser from '../../assets/bear.png';
import './ProductDetail.css';

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
  const [lots, setLots] = useState([]);
const [showLots, setShowLots] = useState(false);

useEffect(() => {
  const fetchLots = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/product/${product_id}/lots`);
      if (!response.ok) {
        throw new Error('Failed to fetch lots');
      }
      const data = await response.json();
      setLots(data);
    } catch (error) {
      console.error('Error fetching lots:', error);
    }
  };

  if (showLots) {
    fetchLots();
  }
}, [showLots, product_id]);


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

  return (
    <div className="page-container">

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
            
                <div className="product-lots-container">
                    {/* กล่องรายละเอียดสินค้า */}
                    <div className="product-detail-card">
                        <img src={`/product/${productDetail.product_image}`} alt={productDetail.product_name}/>
                        <h2>{productDetail.product_name}</h2>
                        <p><strong>Product Type:</strong> {productDetail.product_type}</p>
                        <p><strong>Unit:</strong> {productDetail.product_unit}</p>
                        <p><strong>Quantity in Stock:</strong> {productDetail.product_quantity}</p>
                        <p><strong>Threshold:</strong> {productDetail.threshold}</p>
                        <button className="view-button" onClick={() => setShowLots(!showLots)}>
                        {showLots ? "Hide Lots" : "View All Lots"}
                        </button>
                    </div>

                        {/* กล่องแสดงล็อต */}
                        {showLots && (
                            <div className="lots-container">
                            <h3>All Lots</h3>
                            <ul>
                                {lots.length > 0 ? lots.map(lot => (
                                <li key={lot.lot_id} className="lot-card">
                                    <p><strong>Lot ID:</strong> {lot.lot_id}</p>
                                    <p><strong>Date:</strong> {new Date(lot.lot_date).toLocaleDateString()}</p>
                                    <p><strong>Exp Date:</strong> {new Date(lot.lot_exp).toLocaleDateString()}</p>
                                    <p><strong>Quantity:</strong> {lot.lot_quantity}</p>
                                </li>
                                )) : <p>No lots available</p>}
                            </ul>
                            </div>
                        )}
            </div>

  

    </div>
  );
};

export default ProductDetail;
