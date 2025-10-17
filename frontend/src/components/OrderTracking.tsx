import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import './OrderTracking.css';

type OrderStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

interface OrderItem {
  id: number;
  menu_item: {
    name: string;
    description?: string;
  };
  quantity: number;
  unit_price: number;
  special_requests?: string;
}

interface Order {
  id: number;
  stall_id: number;
  stall_name: string;
  queue_number: number;
  status: OrderStatus;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  created_at: string;
  pickup_window_start: string;
  pickup_window_end: string;
  special_instructions?: string;
  order_items: OrderItem[];
}

const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState<Order | null>(location.state?.order || null);
  const [loading, setLoading] = useState(!order);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [timeUntilPickup, setTimeUntilPickup] = useState('');

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!order) {
      fetchOrder();
    }
    startAutoRefresh();
    startTimeUpdater();

    return () => {
      stopAutoRefresh();
      stopTimeUpdater();
    };
  }, [orderId]);

  const startAutoRefresh = () => {
    // Refresh every 15 seconds for active orders
    refreshIntervalRef.current = setInterval(() => {
      fetchOrder(true);
    }, 15000);
  };

  const stopAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  const startTimeUpdater = () => {
    // Update countdown every second
    timeIntervalRef.current = setInterval(() => {
      if (order) {
        updateTimeUntilPickup(order);
      }
    }, 1000);
  };

  const stopTimeUpdater = () => {
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = null;
    }
  };

  const fetchOrder = async (silent: boolean = false) => {
    if (!orderId) return;

    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await ordersAPI.getById(parseInt(orderId));
      setOrder(response.data);
      updateTimeUntilPickup(response.data);
      setError('');

      // Stop auto-refresh if order is completed or cancelled
      if (response.data.status === 'COMPLETED' || response.data.status === 'CANCELLED') {
        stopAutoRefresh();
      }
    } catch (err: unknown) {
      console.error('Failed to fetch order:', err);
      if (!silent) {
        setError('Failed to load order details. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateTimeUntilPickup = (orderData: Order) => {
    const now = new Date();
    const pickup = new Date(orderData.pickup_window_start);
    const diffMs = pickup.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    if (diffMins < 0) {
      setTimeUntilPickup('Pickup time passed');
    } else if (diffMins === 0 && diffSecs > 0) {
      setTimeUntilPickup(`${diffSecs}s`);
    } else if (diffMins < 60) {
      setTimeUntilPickup(`${diffMins}m ${diffSecs}s`);
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      setTimeUntilPickup(`${hours}h ${mins}m`);
    }
  };

  const getStatusProgress = (status: OrderStatus): number => {
    switch (status) {
      case 'PENDING_PAYMENT': return 20;
      case 'CONFIRMED': return 40;
      case 'PREPARING': return 70;
      case 'READY': return 90;
      case 'COMPLETED': return 100;
      case 'CANCELLED': return 0;
      default: return 0;
    }
  };

  const getStatusInfo = (status: OrderStatus): { color: string; icon: string; label: string; description: string } => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return { color: '#fbbf24', icon: '💳', label: 'Pending Payment', description: 'Please complete payment to proceed' };
      case 'CONFIRMED':
        return { color: '#3b82f6', icon: '✓', label: 'Order Confirmed', description: 'Your order has been sent to the stall' };
      case 'PREPARING':
        return { color: '#f97316', icon: '👨‍🍳', label: 'Preparing', description: 'Your food is being prepared' };
      case 'READY':
        return { color: '#10b981', icon: '🔔', label: 'Ready for Pickup', description: 'Your order is ready! Please collect it' };
      case 'COMPLETED':
        return { color: '#6b7280', icon: '✓', label: 'Completed', description: 'Order has been collected' };
      case 'CANCELLED':
        return { color: '#dc2626', icon: '✕', label: 'Cancelled', description: 'This order has been cancelled' };
      default:
        return { color: '#94a3b8', icon: '?', label: 'Unknown', description: 'Status unknown' };
    }
  };

  const formatPickupTime = (start: string, end: string): string => {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    return `${formatTime(startDate)} - ${formatTime(endDate)}`;
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleCancelOrder = async () => {
    if (!order || !window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await ordersAPI.updateStatus(order.id, { status: 'CANCELLED' });
      fetchOrder();
      alert('Order cancelled successfully');
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { detail?: string } } };
      alert(apiErr.response?.data?.detail || 'Failed to cancel order');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p>{error || 'Order not found'}</p>
        <button onClick={() => fetchOrder()} className="retry-button">
          Retry
        </button>
        <button onClick={() => navigate('/orders')} className="back-button">
          Back to Orders
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const progress = getStatusProgress(order.status);
  const canCancel = order.status === 'PENDING_PAYMENT' || order.status === 'CONFIRMED';

  return (
    <div className="order-tracking-container">
      {/* Header */}
      <header className="tracking-header">
        <button onClick={() => navigate('/orders')} className="back-btn">
          ← Back
        </button>
        <h1>Order Tracking</h1>
        <button onClick={() => fetchOrder()} className="refresh-btn" disabled={refreshing}>
          {refreshing ? '⟳' : '🔄'}
        </button>
      </header>

      <div className="tracking-content">
        {/* Status Card */}
        <div className="status-card">
          <div className="status-header">
            <div className="status-icon-large" style={{ color: statusInfo.color }}>
              {statusInfo.icon}
            </div>
            <div className="status-text">
              <h2 style={{ color: statusInfo.color }}>{statusInfo.label}</h2>
              <p>{statusInfo.description}</p>
            </div>
          </div>

          {/* Progress Bar */}
          {order.status !== 'CANCELLED' && (
            <div className="progress-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: statusInfo.color
                  }}
                ></div>
              </div>
              <div className="progress-label">{progress}% Complete</div>
            </div>
          )}

          {/* Order Info Grid */}
          <div className="info-grid">
            <div className="info-card">
              <span className="info-label">Order Number</span>
              <span className="info-value">#{order.id.toString().padStart(6, '0')}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Queue Position</span>
              <span className="info-value queue-highlight">#{order.queue_number}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Ordered At</span>
              <span className="info-value">{formatDateTime(order.created_at)}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Pickup Window</span>
              <span className="info-value">
                {formatPickupTime(order.pickup_window_start, order.pickup_window_end)}
              </span>
            </div>
          </div>

          {/* Countdown Timer */}
          {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
            <div className="countdown-timer">
              <span className="timer-icon">⏰</span>
              <span className="timer-label">Time until pickup:</span>
              <span className="timer-value">{timeUntilPickup}</span>
            </div>
          )}

          {/* Payment Warning */}
          {order.payment_status === 'PENDING' && (
            <div className="payment-warning">
              💳 Payment is pending. Complete payment to proceed with your order.
            </div>
          )}

          {/* Ready Alert */}
          {order.status === 'READY' && (
            <div className="ready-alert-banner">
              🔔 Your order is ready! Please collect it at {order.stall_name}
            </div>
          )}
        </div>

        {/* Stall Info Card */}
        <div className="detail-card">
          <h3>Stall Information</h3>
          <div className="stall-details">
            <div className="stall-name-section">
              <span className="stall-icon">🍽️</span>
              <div>
                <div className="stall-name">{order.stall_name}</div>
                <div className="stall-label">Stall ID: {order.stall_id}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Card */}
        <div className="detail-card">
          <h3>Order Items</h3>
          <div className="items-list">
            {order.order_items.map((item) => (
              <div key={item.id} className="item-row">
                <div className="item-info">
                  <div className="item-name">{item.menu_item.name}</div>
                  {item.special_requests && (
                    <div className="item-special">Note: {item.special_requests}</div>
                  )}
                </div>
                <div className="item-quantity">× {item.quantity}</div>
                <div className="item-price">${(item.unit_price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {order.special_instructions && (
            <div className="special-instructions">
              <strong>Special Instructions:</strong>
              <p>{order.special_instructions}</p>
            </div>
          )}

          <div className="order-total">
            <span>Total Amount</span>
            <span className="total-amount">${order.total_amount.toFixed(2)}</span>
          </div>

          <div className="payment-method">
            Payment Method: <strong>{order.payment_method}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {canCancel && (
            <button onClick={handleCancelOrder} className="cancel-order-btn">
              Cancel Order
            </button>
          )}
          <button onClick={() => navigate('/orders')} className="view-all-orders-btn">
            View All Orders
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
