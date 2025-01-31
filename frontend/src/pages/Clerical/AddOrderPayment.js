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
                        const response = await fetch(`http://localhost:3001/api/orders/${order_id}`);
                        const data = await response.json();
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
        setOrderAmounts((prev) => ({ ...prev, [order_id]: amount }));
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

    return (
        <div className="payment-container-custom">
            <h1 className="payment-title-custom">Enter Payment Amounts</h1>
            <div className="order-list-custom">
                {orderDetails.map((order) => (
                    <div key={order.order_id} className="order-card-custom">
                        <h2 className="order-id-custom">Order ID: {order.order_id}</h2>
                        <p className="order-detail-custom"><strong>Employee ID:</strong> {order.employee_id}</p>
                        <p className="order-detail-custom"><strong>Order Date:</strong> {new Date(order.order_date).toLocaleDateString()}</p>
                        <p className="order-detail-custom"><strong>Order Status:</strong> {order.order_status}</p>
                        <label className="order-label-custom">Enter Order Amount:</label>
                        <input
                            type="number"
                            min="0"
                            className="order-input-custom"
                            placeholder="Enter payment amount"
                            value={orderAmounts[order.order_id] || ''}
                            onChange={(e) => handleInputChange(order.order_id, e.target.value)}
                        />
                    </div>
                ))}
            </div>
            <button className="submit-button-custom" onClick={handleSubmit}>
                Submit
            </button>
        </div>
    );
};

export default AddOrderPayment;
