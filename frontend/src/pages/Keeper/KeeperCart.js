import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './KeeperCart.css';
import shrimpLogo from '../../assets/shrimp.png';
import cartIcon from '../../assets/cart.png';
import iconUser from '../../assets/bear.png';

const KeeperCart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const {
    employee_fname,
    employee_lname,
    employee_image,
    employee_id,
    employee_position,
    cart,
  } = location.state || {};

  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  const createOrder = () => {
    if (!cart || cart.length === 0) {
      alert('There are no products in the cart. Please add more products.');
      return;
    }

    console.log('Cart items:', cart);

    fetch('http://localhost:3001/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employee_id: employee_id,
        cart: cart,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Order created successfully:', data);
        alert('Order created successfully!');
        navigate('/keeper/home', { state: { employee_fname, employee_lname, employee_image, employee_id, employee_position } });
      })
      .catch((error) => {
        console.error('Error creating order:', error);
        alert('An error occurred while creating the order.');
      });
  };

  const addMoreItems = () => {
    navigate('/keeper/orders', {
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
  };

  return (
    <div>
      <div className="navbar">
        <div className="logo">
          <img src={shrimpLogo} alt="Shrimp Logo" />
          <button className="menu-button" onClick={toggleMenu}>
            <span className="menu-icon">&#9776;</span>
          </button>
          <span>Shrimp Farm</span>
        </div>
        <div className="user-profile">
          <img src={employeeImagePath} alt="User Profile" className="user-avatar" />
        </div>
      </div>

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

      <div className="content-cart">
        <h1>Hey, {employee_fname || 'Guest'} {employee_lname || ''}, here is your cart 🛒</h1>
        <hr />
        <div className="cart-items">
          {cart && cart.length > 0 ? (
            cart.map((item, index) => (
              <div key={index} className="cart-item">
                <img src={`/product/${item.product_image}`} alt={item.product_name} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                <div className="cart-item-details">
                  <h3>{item.product_name}</h3>
                  <p>Quantity: {item.quantity}</p>
                  <p>Unit: {item.unit}</p>
                </div>
              </div>
            ))
          ) : (
            <>
              <p>Your cart is empty. Please add items to the cart.</p>
              <button className="add-more-items-button" onClick={addMoreItems}>Add More Items</button>
            </>
          )}
        </div>

        {cart && cart.length > 0 && (
          <>
            <button className="add-more-items-button" onClick={addMoreItems}>Add More Items</button>
            <button className="confirm-order-button" onClick={createOrder}>Confirm Order</button>
          </>
        )}
      </div>

      <div className="cart-icon" onClick={() => navigate('/keeper/cart', { state: { employee_fname, employee_lname, employee_image, employee_id, employee_position, cart } })}>
        <img src={cartIcon} alt="Cart Icon" />
        <span className="cart-count">{cart?.length || 0}</span>
      </div>
    </div>
  );
};

export default KeeperCart;
