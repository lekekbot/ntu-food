import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { queueAPI, ordersAPI } from '../services/api';
import './QueueStatus.css';

const QueueStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { order: initialOrder, stall } = location.state || {};

  const [order, setOrder] = useState(initialOrder);
  const [queuePosition, setQueuePosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!initialOrder) {
      navigate('/stalls');
      return;
    }

    fetchQueueStatus();

    // Set up polling to update queue status every 30 seconds
    const interval = setInterval(fetchQueueStatus, 30000);

    return () => clearInterval(interval);
  }, [initialOrder]);

  const fetchQueueStatus = async () => {
    try {
      const [queueResponse, orderResponse] = await Promise.all([
        queueAPI.getPosition(initialOrder.id),
        ordersAPI.getById(initialOrder.id)
      ]);

      setQueuePosition(queueResponse.data);
      setOrder(orderResponse.data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch queue status:', error);
      setError('Failed to update queue status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'accepted':
        return '#3b82f6';
      case 'preparing':
        return '#f97316';
      case 'ready':
        return '#10b981';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'accepted':
        return '✅';
      case 'preparing':
        return '👨‍🍳';
      case 'ready':
        return '🔔';
      case 'completed':
        return '✅';
      case 'cancelled':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return 'Your order has been placed and is waiting for confirmation';
      case 'accepted':
        return 'Your order has been accepted and is in the queue';
      case 'preparing':
        return 'Your order is being prepared';
      case 'ready':
        return 'Your order is ready for pickup!';
      case 'completed':
        return 'Your order has been completed';
      case 'cancelled':
        return 'Your order has been cancelled';
      default:
        return 'Order status unknown';
    }
  };

  if (!initialOrder) {
    return (
      <div className="error-container">
        <p>No order information found.</p>
        <button onClick={() => navigate('/stalls')} className="back-button">
          Back to Stalls
        </button>
      </div>
    );
  }

  if (loading && !queuePosition) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading order status...</p>
      </div>
    );
  }

  return (
    <div className="queue-status-container">
      <header className="queue-header">
        <button onClick={() => navigate('/orders')} className="back-button">
          ← View All Orders
        </button>
        <h1>Order Status</h1>
      </header>

      <div className="queue-content">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchQueueStatus} className="retry-button">
              Retry
            </button>
          </div>
        )}

        <div className="order-card">
          <div className="order-header-info">
            <h2>Order #{order.order_number}</h2>
            <div
              className="status-badge"
              style={{ backgroundColor: getStatusColor(order.status) }}
            >
              {getStatusIcon(order.status)} {order.status.toUpperCase()}
            </div>
          </div>

          <div className="stall-info">
            <h3>{stall?.name}</h3>
            <p>📍 {stall?.location}</p>
          </div>

          <div className="status-message">
            <p>{getStatusMessage(order.status)}</p>
          </div>

          {queuePosition && (
            <div className="queue-info">
              <div className="queue-stats">
                <div className="stat-item">
                  <span className="stat-label">Queue Position</span>
                  <span className="stat-value">#{queuePosition.queue_position}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Orders Ahead</span>
                  <span className="stat-value">{queuePosition.orders_ahead}</span>
                </div>
                {queuePosition.estimated_wait_time && (
                  <div className="stat-item">
                    <span className="stat-label">Est. Wait Time</span>
                    <span className="stat-value">{queuePosition.estimated_wait_time} min</span>
                  </div>
                )}
              </div>

              {queuePosition.estimated_ready_time && (
                <div className="ready-time">
                  <span className="ready-label">Estimated Ready Time:</span>
                  <span className="ready-value">
                    {new Date(queuePosition.estimated_ready_time).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="order-details">
            <h4>Order Details</h4>
            <div className="order-items">
              {order.order_items?.map((item, index) => (
                <div key={index} className="order-item">
                  <span className="item-name">
                    {item.menu_item?.name || `Item ${item.menu_item_id}`} x {item.quantity}
                  </span>
                  <span className="item-price">
                    ${(item.unit_price * item.quantity).toFixed(2)}
                  </span>
                  {item.special_requests && (
                    <div className="special-requests">
                      Note: {item.special_requests}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="order-total">
              <strong>Total: ${order.total_amount?.toFixed(2)}</strong>
            </div>

            {order.special_instructions && (
              <div className="special-instructions">
                <strong>Special Instructions:</strong>
                <p>{order.special_instructions}</p>
              </div>
            )}
          </div>

          <div className="order-actions">
            <button onClick={fetchQueueStatus} className="refresh-button">
              🔄 Refresh Status
            </button>

            {order.status === 'ready' && (
              <div className="pickup-alert">
                <strong>🔔 Your order is ready for pickup!</strong>
                <p>Please collect your order from {stall?.location}</p>
              </div>
            )}
          </div>
        </div>

        <div className="navigation-buttons">
          <button onClick={() => navigate('/stalls')} className="nav-button">
            Order More Food
          </button>
          <button onClick={() => navigate('/orders')} className="nav-button secondary">
            View All Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default QueueStatus;