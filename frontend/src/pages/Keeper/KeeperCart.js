import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './KeeperCart.css';
import shrimpLogo from '../../assets/shrimp.png';
import cartIcon from '../../assets/cart.png';
import iconUser from '../../assets/bear.png';

const KeeperCart = () => {
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
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    
    // If location.state.cart exists and has items, use that instead
    // This allows for direct navigation with cart items
    if (location.state?.cart && location.state.cart.length > 0) {
      setCart(location.state.cart);
      // Sync with localStorage
      localStorage.setItem("cart", JSON.stringify(location.state.cart));
    } else {
      setCart(savedCart);
    }
  }, [location.state]);

  // Fetch the appropriate units when editing an item
  useEffect(() => {
    if (editingIndex >= 0 && cart[editingIndex]) {
      const item = cart[editingIndex];
      // Determine if this is a food or chemical product by checking the first few characters
      // This is a simplistic approach - ideally, you would have product_type stored with each cart item
      
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

  const createOrder = () => {
    if (!cart || cart.length === 0) {
      alert('There are no products in the cart. Please add more products.');
      return;
    }

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
        alert('Order created successfully!');
        // Clear localStorage and state
        localStorage.removeItem("cart");
        setCart([]);
        setOrderConfirmed(true); // Set order confirmed to true to show back button
      })
      .catch((error) => {
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

  const removeItem = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    // Update localStorage
    localStorage.setItem("cart", JSON.stringify(newCart));
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
    localStorage.setItem("cart", JSON.stringify(newCart));
    // Trigger storage event for other components to update
    window.dispatchEvent(new Event('storage'));
    // Exit edit mode
    setEditingIndex(-1);
  };

  const navigateToPage = (path) => {
    navigate(path, {
      state: { 
        employee_fname, 
        employee_lname, 
        employee_image, 
        employee_id, 
        employee_position 
      }
    });
  };

  const navigateToHome = () => {
    navigate('/keeper/home', { 
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
        {orderConfirmed ? (
          <>
            <h1>Order Confirmed Successfully! ✅</h1>
            <p className="success-message">Your order has been placed. Thank you!</p>
            <button className="back-to-home-button" onClick={navigateToHome}>
              Back to Home
            </button>
          </>
        ) : (
          <>
            <h1>Hey, {employee_fname || 'Guest'} {employee_lname || ''}, here is your cart 🛒</h1>
            <hr />
            <div className="cart-items">
              {cart && cart.length > 0 ? (
                cart.map((item, index) => (
                  <div key={index} className="cart-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img src={`/product/${item.product_image}`} alt={item.product_name} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
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
                  <button className="add-more-items-button" onClick={addMoreItems}>Add More Items</button>
                </>
              )}
            </div>

            {cart && cart.length > 0 && (
              <div className="cart-actions">
                <button className="add-more-items-button" onClick={addMoreItems}>Add More Items</button>
                <button className="confirm-order-button" onClick={createOrder}>Confirm Order</button>
              </div>
            )}
          </>
        )}
      </div>

      {!orderConfirmed && (
        <div className="cart-icon" onClick={() => navigate('/keeper/cart', { 
          state: { employee_fname, employee_lname, employee_image, employee_id, employee_position, cart } 
        })}>
          <img src={cartIcon} alt="Cart Icon" />
          <span className="cart-count">{cart.length}</span>
        </div>
      )}
    </div>
  );
};

export default KeeperCart;