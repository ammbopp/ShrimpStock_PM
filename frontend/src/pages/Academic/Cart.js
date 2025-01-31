import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Cart.css';
import shrimpLogo from '../../assets/shrimp.png';
import cartIcon from '../../assets/cart.png';
import iconUser from '../../assets/bear.png';

const Cart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

  // รับข้อมูลผู้ใช้และสินค้าจาก state ที่ถูกส่งมาจากหน้าก่อน
  const {
    employee_fname,
    employee_lname,
    employee_image,
    employee_id,
    employee_position,
    cart,
  } = location.state || {};

  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  // ฟังก์ชันในการสร้างใบเบิก
  const createRequest = () => {
    if (!cart || cart.length === 0) {
      alert('ไม่มีสินค้าในตะกร้า กรุณาเพิ่มสินค้า');
      return;
    }

    console.log('Cart items:', cart);

    fetch('http://localhost:3001/api/create-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employee_id: employee_id,
        cart: cart,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Request created successfully:', data);
        alert('Request created successfully!');
        // หลังจากสร้างใบเบิกสำเร็จ ให้ผู้ใช้ไปที่หน้า Home หรือหน้าประวัติการเบิก
        navigate('/academic/home', {
          state: {
            employee_fname,
            employee_lname,
            employee_image,
            employee_id,
            employee_position,
          },
        });
      })
      .catch((error) => {
        console.error('Error creating request:', error);
        alert('An error occurred while creating the request.');
      });
  };

  const addMoreItems = () => {
    navigate('/academic/request-menu', {
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
      <div
        className="navbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '60%',
          zIndex: 1000,
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="logo">
          <img src={shrimpLogo} alt="Shrimp Logo" />
          <button className="menu-button" onClick={toggleMenu}>
            <span className="menu-icon">&#9776;</span>
          </button>
          <span>Shrimp Farm</span>
        </div>
        <div className="user-profile">
          <img
            src={employeeImagePath}
            alt="User Profile"
            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
          />
        </div>
      </div>

      <div className={`side-menu ${menuOpen ? 'open' : ''}`}>
        <ul>
          <li onClick={() => navigateToPage('/academic/home')}>Home</li>
          <li onClick={() => navigateToPage('/academic/profile')}>Profile</li>
          <li onClick={() => navigateToPage('/academic/requests/:employee_id')}>Request History</li>
          <li onClick={() => navigateToPage('/academic/request-menu')}>Product Request</li>
          <li onClick={() => navigateToPage('/login')}>Logout</li>
        </ul>
      </div>

      {/* Main content */}
      <div className="content-cart" style={{ marginTop: '60px' }}>
        <h1>
          Hey, <span id="username">{employee_fname || 'Guest'} {employee_lname || ''}</span> here
          is your cart 🛒
        </h1>
        <hr />

        {/* Cart Items */}
        <div className="cart-items">
          {cart && cart.length > 0 ? (
            cart.map((item, index) => (
              <div key={index} className="cart-item">
                <img
                  src={`/product/${item.product_image}`}
                  alt={item.product_name}
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
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
            <button className="add-more-items-button" onClick={addMoreItems}>
              Add More Items
            </button>
            </>
          )}
        </div>

        {/* Confirm Request Button */}
        {cart && cart.length > 0 && (
          <>
            <button className="add-more-items-button" onClick={addMoreItems}>
              Add More Items
            </button>

            <button className="confirm-request-button" onClick={createRequest}>
              Confirm Request
            </button>

          </>
        )}
      </div>

      {/* Cart icon at bottom right */}
      <div className="cart-icon" onClick={() => navigate('/academic/cart', { state: { employee_fname, employee_lname, employee_image, employee_id, employee_position, cart } })}>
        <img src={cartIcon} alt="Cart Icon" />
        <span className="cart-count">{cart?.length || 0}</span>
      </div>
    </div>
  );
};

export default Cart;
