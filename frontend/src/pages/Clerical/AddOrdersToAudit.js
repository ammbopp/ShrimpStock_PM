import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddOrdersToAudit.css';

const AddOrdersToAudit = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAcceptedOrders = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/audit/orders/accepted');
                const data = await response.json();
                setOrders(data);
            } catch (error) {
                console.error('Error fetching orders:', error);
            }
        };
    
        fetchAcceptedOrders();
    }, []);

    const handleOrderSelection = (order_id) => {
        setSelectedOrders(prev =>
            prev.includes(order_id) ? prev.filter(id => id !== order_id) : [...prev, order_id]
        );
    };

    const proceedToPayment = () => {
        navigate('/clerical/add-orders/payment', { state: { selectedOrders } });
    };

    return (
        <div className='page-container'>
            <div className='content'>
            <div className="add-orders-to-audit-container">
                <h1>Select Orders to Add to Audit</h1>
                <div className="orders-list">
                    {orders.map(order => (
                        <div key={order.order_id} className="order-card">
                            <input
                                type="checkbox"
                                checked={selectedOrders.includes(order.order_id)}
                                onChange={() => handleOrderSelection(order.order_id)}
                            />
                            <span className="order-id">Order ID: {order.order_id}</span>
                            <span className="order-details">Details about the order...</span>
                        </div>
                    ))}
                </div>
                <button
                    className="proceed-button"
                    onClick={proceedToPayment}
                    disabled={selectedOrders.length === 0}
                >
                    Proceed to Payment
                </button>
            </div>
            </div>
    </div>
    );
};

export default AddOrdersToAudit;
