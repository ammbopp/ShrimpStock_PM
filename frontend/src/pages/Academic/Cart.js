import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Cart.css';
import shrimpLogo from '../../assets/shrimp.png';
import cartIcon from '../../assets/cart.png';
import iconUser from '../../assets/bear.png';

const Cart = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  
  // State for tracking which item is being edited
  const [editingIndex, setEditingIndex] = useState(-1);
  // States for storing the edited values
  const [editQuantity, setEditQuantity] = useState(1);
  const [editUnit, setEditUnit] = useState('');
  // State for units available
  const [units, setUnits] = useState([]);

  // Get employee data from location state
  const {
    employee_fname,
    employee_lname,
    employee_image,
    employee_id,
    employee_position,
  } = location.state || {};

  // Initialize cart from localStorage or location state
  useEffect(() => {
    // First try to get cart from localStorage
    const savedCart = JSON.parse(localStorage.getItem("academicCart")) || [];
    
    // If location.state.cart exists and has items, use that instead
    if (location.state?.cart && location.state.cart.length > 0) {
      setCart(location.state.cart);
      // Sync with localStorage
      localStorage.setItem("academicCart", JSON.stringify(location.state.cart));
    } else {
      setCart(savedCart);
    }
  }, [location.state]);

  // Fetch the appropriate units when editing an item
  useEffect(() => {
    if (editingIndex >= 0 && cart[editingIndex]) {
      const item = cart[editingIndex];
      
      // We need to fetch the product type first
      fetch(`http://localhost:3001/api/product-detail/${item.product_id}`)
        .then(response => response.json())
        .then(data => {
          if (data && data.product_type) {
            const unitType = data.product_type === 'Food' ? 'food' : 'chem';
            // Now fetch the units for this type
            fetch(`http://localhost:3001/api/units/${unitType}`)
              .then(response => response.json())
              .then(unitsData => {
                setUnits(unitsData);
                // Initialize the edit unit with the current unit
                setEditUnit(item.unit);
                // Initialize the edit quantity with the current quantity
                setEditQuantity(item.quantity);
              })
              .catch(error => console.error('Error fetching units:', error));
          }
        })
        .catch(error => console.error('Error fetching product details:', error));
    }
  }, [editingIndex, cart]);

  const employeeImagePath = employee_image ? `/avatar/${employee_image}` : iconUser;

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

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
        // Clear localStorage and state after successful request
        localStorage.removeItem("academicCart");
        setCart([]);
        setOrderConfirmed(true);
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

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    // Update localStorage
    localStorage.setItem("academicCart", JSON.stringify(newCart));
    // Trigger storage event for other components to update
    window.dispatchEvent(new Event('storage'));
  };

  // Function to start editing an item
  const startEditing = (index) => {
    setEditingIndex(index);
  };

  // Function to cancel editing
  const cancelEditing = () => {
    setEditingIndex(-1);
  };

  // Function to confirm and apply the edits
  const confirmEditing = (index) => {
    if (editQuantity <= 0) {
      alert('Quantity must be greater than 0');
      return;
    }
    
    if (!editUnit) {
      alert('Please select a unit');
      return;
    }

    // Create a new cart with the updated item
    const newCart = [...cart];
    newCart[index] = {
      ...newCart[index],
      quantity: editQuantity,
      unit: editUnit
    };

    setCart(newCart);
    // Update localStorage
    localStorage.setItem("academicCart", JSON.stringify(newCart));
    // Trigger storage event for other components to update
    window.dispatchEvent(new Event('storage'));
    // Exit edit mode
    setEditingIndex(-1);
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

  const navigateToHome = () => {
    navigate('/academic/home', { 
      state: { 
        employee_fname, 
        employee_lname, 
        employee_image, 
        employee_id, 
        employee_position 
      } 
    });
  };

  return (
    <div className="page-container" style={{marginTop:'140px'}}>
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
        {orderConfirmed ? (
          <>
            <h1>Request Confirmed Successfully! ✅</h1>
            <p className="success-message">Your request has been placed. Thank you!</p>
            <button className="back-to-home-button" onClick={navigateToHome}>
              Back to Home
            </button>
          </>
        ) : (
          <>
            <h1>
              Hey, <span id="username">{employee_fname || 'Guest'} {employee_lname || ''}</span> here
              is your cart 🛒
            </h1>
            <hr />

            {/* Cart Items */}
            <div className="cart-items">
              {cart && cart.length > 0 ? (
                cart.map((item, index) => (
                  <div key={index} className="cart-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img
                        src={`/product/${item.product_image}`}
                        alt={item.product_name}
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                      <div className="cart-item-details" style={{ marginLeft: '10px', textAlign: 'left' }}>
                        <h3>{item.product_name}</h3>
                        {editingIndex === index ? (
                          <div className="edit-item-form">
                            <div className="edit-field">
                              <label>Quantity:</label>
                              <input 
                                type="number" 
                                value={editQuantity} 
                                min="1"
                                onChange={(e) => setEditQuantity(Number(e.target.value))} 
                              />
                            </div>
                            <div className="edit-field">
                              <label>Unit:</label>
                              <select 
                                value={editUnit} 
                                onChange={(e) => setEditUnit(e.target.value)}
                              >
                                <option value="" disabled>Select Unit</option>
                                {units.map((unitItem) => (
                                  <option key={unitItem.unit_id} value={unitItem.unit_name}>
                                    {unitItem.unit_name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="edit-actions" style={{ marginTop: '10px' }}>
                              <button className="confirm-edit-button" onClick={() => confirmEditing(index)}>Confirm</button>
                              <button className="cancel-edit-button" onClick={cancelEditing}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p>Quantity: {item.quantity}</p>
                            <p>Unit: {item.unit}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="item-actions">
                      {editingIndex === index ? null : (
                        <>
                          <button className="edit-item-button" onClick={() => startEditing(index)}>Edit</button>
                          <button className="remove-item-button" onClick={() => removeItem(index)}>Remove</button>
                        </>
                      )}
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
              <div className="cart-actions">
                <button className="add-more-items-button" onClick={addMoreItems}>
                  Add More Items
                </button>

                <button className="confirm-request-button" onClick={createRequest}>
                  Confirm Request
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Cart icon at bottom right */}
      <div className="cart-icon">
        <img src={cartIcon} alt="Cart Icon" />
        <span className="cart-count">{cart?.length || 0}</span>
      </div>
    </div>
  );
};

export default Cart;