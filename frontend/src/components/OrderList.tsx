import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI, queueAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './OrderList.css';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = async (order) => {
    try {
      // Get fresh order data and queue position
      const orderResponse = await ordersAPI.getById(order.id);
      navigate('/queue-status', {
        state: {
          order: orderResponse.data,
          stall: {
            id: order.stall_id,
            name: order.stall_name,
            location: 'Check stall details' // We have limited stall info in order summary
          }
        }
      });
    } catch (error) {
      console.error('Failed to get order details:', error);
      alert('Failed to load order details. Please try again.');
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="order-list-container">
      <header className="order-list-header">
        <div className="header-content">
          <h1>My Orders</h1>
          <div className="user-info">
            <span>Welcome, {user?.name}</span>
            <button onClick={() => navigate('/stalls')} className="stalls-button">
              Browse Stalls
            </button>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="order-list-main">
        <div className="order-list-content">
          {error && (
            <div className="error-message">
              {error}
              <button onClick={fetchOrders} className="retry-button">
                Retry
              </button>
            </div>
          )}

          {orders.length === 0 && !loading ? (
            <div className="no-orders">
              <div className="no-orders-icon">🍽️</div>
              <h2>No Orders Yet</h2>
              <p>You haven't placed any orders yet. Start by browsing our food stalls!</p>
              <button onClick={() => navigate('/stalls')} className="browse-button">
                Browse Food Stalls
              </button>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="order-card"
                  onClick={() => handleOrderClick(order)}
                >
                  <div className="order-header">
                    <div className="order-number">
                      Order #{order.order_number || order.id}
                    </div>
                    <div
                      className="order-status"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusIcon(order.status)} {order.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="order-info">
                    <h3>{order.stall_name}</h3>
                    <div className="order-details">
                      <div className="order-amount">
                        ${order.total_amount.toFixed(2)}
                      </div>
                      {order.queue_number && (
                        <div className="queue-number">
                          Queue #{order.queue_number}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="order-time">
                    <span className="time-label">Ordered:</span>
                    <span className="time-value">
                      {new Date(order.created_at).toLocaleDateString()} {' '}
                      {new Date(order.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {order.estimated_ready_time && order.status !== 'completed' && order.status !== 'cancelled' && (
                    <div className="estimated-time">
                      <span className="time-label">Est. Ready:</span>
                      <span className="time-value">
                        {new Date(order.estimated_ready_time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}

                  <div className="order-actions">
                    {order.status === 'ready' && (
                      <div className="ready-indicator">
                        🔔 Ready for pickup!
                      </div>
                    )}
                    <div className="view-details">
                      Click to view details →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="refresh-section">
            <button onClick={fetchOrders} className="refresh-button">
              🔄 Refresh Orders
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderList;