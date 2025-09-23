import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import './OrderForm.css';

const OrderForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { stall, cart, totalAmount } = location.state || {};

  const [orderData, setOrderData] = useState({
    pickup_time: '',
    special_instructions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!stall || !cart || cart.length === 0) {
    return (
      <div className="error-container">
        <p>No order data found. Please go back and add items to your cart.</p>
        <button onClick={() => navigate('/stalls')} className="back-button">
          Back to Stalls
        </button>
      </div>
    );
  }

  const handleInputChange = (e) => {
    setOrderData({
      ...orderData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare order data for API
      const orderPayload = {
        stall_id: stall.id,
        items: cart.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          special_requests: item.special_requests || null
        })),
        pickup_time: orderData.pickup_time ? new Date(orderData.pickup_time).toISOString() : null,
        special_instructions: orderData.special_instructions || null
      };

      const response = await ordersAPI.create(orderPayload);
      const order = response.data;

      // Navigate to queue status with order info
      navigate('/queue-status', {
        state: {
          order,
          stall
        }
      });

    } catch (error) {
      console.error('Failed to place order:', error);
      setError(error.response?.data?.detail || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="order-form-container">
      <header className="order-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back to Menu
        </button>
        <h1>Complete Your Order</h1>
      </header>

      <div className="order-content">
        <div className="order-summary">
          <h2>Order Summary</h2>

          <div className="stall-info">
            <h3>{stall.name}</h3>
            <p>📍 {stall.location}</p>
          </div>

          <div className="order-items">
            {cart.map((item) => (
              <div key={item.menu_item_id} className="order-item">
                <div className="item-details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">x {item.quantity}</span>
                </div>
                <div className="item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                {item.special_requests && (
                  <div className="special-requests">
                    Note: {item.special_requests}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="total-amount">
            <strong>Total: ${totalAmount.toFixed(2)}</strong>
          </div>
        </div>

        <div className="order-form">
          <h2>Order Details</h2>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="pickup_time">
                Preferred Pickup Time (Optional)
              </label>
              <input
                type="datetime-local"
                id="pickup_time"
                name="pickup_time"
                value={orderData.pickup_time}
                onChange={handleInputChange}
                min={getMinDateTime()}
                className="form-input"
              />
              <small className="form-help">
                Leave empty for ASAP pickup. Minimum 30 minutes from now.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="special_instructions">
                Special Instructions (Optional)
              </label>
              <textarea
                id="special_instructions"
                name="special_instructions"
                value={orderData.special_instructions}
                onChange={handleInputChange}
                placeholder="Any special instructions for your order..."
                rows="3"
                className="form-textarea"
                maxLength="500"
              />
              <small className="form-help">
                {orderData.special_instructions.length}/500 characters
              </small>
            </div>

            <div className="order-info">
              <div className="info-item">
                <span className="info-label">🕒 Estimated Prep Time:</span>
                <span className="info-value">{stall.avg_prep_time || 15} minutes</span>
              </div>
              <div className="info-item">
                <span className="info-label">📍 Pickup Location:</span>
                <span className="info-value">{stall.location}</span>
              </div>
            </div>

            <button
              type="submit"
              className="place-order-button"
              disabled={loading}
            >
              {loading ? 'Placing Order...' : `Place Order - $${totalAmount.toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;