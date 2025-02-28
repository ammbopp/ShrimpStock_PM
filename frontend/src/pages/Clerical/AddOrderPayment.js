import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AddOrderPayment.css';

const AddOrderPayment = () => {
    const { state } = useLocation();
    const { selectedOrders } = state;
    const [orderDetails, setOrderDetails] = useState([]);
    const [orderAmounts, setOrderAmounts] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const details = await Promise.all(
                    selectedOrders.map(async (order_id) => {
                        const response = await fetch(`http://localhost:3001/api/orders2/${order_id}`);
                        const data = await response.json();
                        console.log("Fetched Order Data:", data);
                        return data;
                    })
                );
                setOrderDetails(details);
            } catch (error) {
                console.error('Error fetching order details:', error);
            }
        };
    
        fetchOrderDetails();
    }, [selectedOrders]);
    

    const handleInputChange = (order_id, amount) => {
        setOrderAmounts((prev) => ({
            ...prev,
            [order_id]: parseFloat(amount) || 0,
        }));
    };
    

    const handleSubmit = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/audits/latest/add-orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orders: selectedOrders.map((order_id) => ({
                        order_id,
                        order_amount: parseFloat(orderAmounts[order_id]) || 0,
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add orders to audit');
            }

            alert('Orders added to audit successfully!');
            navigate('/clerical/audit');
        } catch (error) {
            console.error('Error adding orders:', error);
        }
    };

    const order = orderDetails.length > 0 ? orderDetails[0] : null;

    return (
        <div className="payment-container-custom">
            <h1 className="payment-title-custom">Enter Payment Amounts</h1>
            <div className="order-list-custom">
                {order ? (
                <div key={order.order_id} className="order-card-custom">
                    <h2 className="order-id-custom">Order ID : {order.order_id}</h2>
                    <p className="order-detail-custom"><strong>Employee ID :</strong> {order.employee_id}</p>
                    <p className="order-detail-custom"><strong>Order Status :</strong> {order.order_status || "N/A"}</p>

                    <h3 className="order-detail-custom">Products :</h3>
                    <div className="product-list">
                        {order?.products?.length > 0 ? (
                            order.products.map((item, index) => (
                                <div key={index} className="product-item">
                                    <img 
                                        src={`/product/${item.product_image}`} 
                                        alt={item.product_name} 
                                        style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                                    />
                                    <div className="product-details">
                                        <h3>{item.product_name}</h3>
                                        <p>Quantity: {item.order_quantity}</p>
                                        <p>Unit: {item.unit_name}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>No products available</p>
                        )}
                    </div>
                    <div className="order-detail-custom">
                    {/* ✅ ช่องกรอก "ยอดรวมออเดอร์" */}
                    <p><strong>Enter Order Amount :  </strong></p>
                        <input
                            type="number"
                            min="0"
                            className="order-input-custom"
                            placeholder="Enter payment amount"
                            value={orderAmounts[order.order_id] || ''}
                            onChange={(e) => handleInputChange(order.order_id, e.target.value)}
                            style={{ width: "300px", padding: "10px", fontSize: "16px" }}
                        />
                        <span style={{ fontSize: "16px"}}>Bath</span>
                    </div>
            </div>
        ) : (
            <p>Loading order details...</p>
        )}
        
        </div>
            <button className="submit-button-custom" onClick={handleSubmit}>
                Submit
            </button>
        </div>
    );
};

export default AddOrderPayment;
