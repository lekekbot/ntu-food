import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './StallOwnerDashboard.css';

type OrderStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

interface OrderItem {
  id: number;
  menu_item: {
    name: string;
  };
  quantity: number;
  unit_price: number;
  special_requests?: string;
}

interface Order {
  id: number;
  user_id: number;
  user?: {
    name: string;
    email: string;
  };
  queue_number: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  total_amount: number;
  created_at: string;
  pickup_window_start: string;
  pickup_window_end: string;
  special_instructions?: string;
  order_items: OrderItem[];
}

const StallOwnerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchOrders();
    startAutoRefresh();

    return () => {
      stopAutoRefresh();
    };
  }, []);

  const startAutoRefresh = () => {
    // Auto-refresh every 5 seconds for stall owners
    refreshIntervalRef.current = setInterval(() => {
      fetchOrders(true);
    }, 5000);
  };

  const stopAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  const fetchOrders = async (silent: boolean = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await ordersAPI.getStallOrders();
      setOrders(response.data);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      if (!silent) {
        setError('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleConfirmPayment = async (orderId: number) => {
    setActionLoading(true);
    try {
      await ordersAPI.confirmPayment(orderId, { payment_reference: `PAY-${Date.now()}` });
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to confirm payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    setActionLoading(true);
    try {
      await ordersAPI.updateStatus(orderId, { status: newStatus });
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    setActionLoading(true);
    try {
      await ordersAPI.completeOrder(orderId);
      await fetchOrders();
      setSelectedOrder(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to complete order');
    } finally {
      setActionLoading(false);
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPickupWindow = (start: string, end: string): string => {
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const hours = Math.floor(diffMins / 60);
    return `${hours}h ago`;
  };

  const filterOrdersByStatus = (status: OrderStatus | 'PENDING_PAYMENT'): Order[] => {
    if (status === 'PENDING_PAYMENT') {
      return orders.filter(order => order.payment_status === 'PENDING' && order.status === 'PENDING_PAYMENT');
    }
    return orders.filter(order => order.status === status && order.payment_status !== 'PENDING');
  };

  const pendingPaymentOrders = filterOrdersByStatus('PENDING_PAYMENT');
  const confirmedOrders = filterOrdersByStatus('CONFIRMED');
  const preparingOrders = filterOrdersByStatus('PREPARING');
  const readyOrders = filterOrdersByStatus('READY');

  const totalActiveOrders = pendingPaymentOrders.length + confirmedOrders.length + preparingOrders.length + readyOrders.length;

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="stall-dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🍽️ Stall Owner Dashboard</h1>
          <p className="header-subtitle">Welcome, {user?.name}!</p>
        </div>
        <div className="header-right">
          {refreshing && <span className="refreshing-badge">Updating...</span>}
          <button onClick={() => fetchOrders()} className="refresh-btn">
            🔄
          </button>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-value">{totalActiveOrders}</div>
          <div className="stat-label">Active Orders</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-value">{pendingPaymentOrders.length}</div>
          <div className="stat-label">Pending Payment</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{confirmedOrders.length}</div>
          <div className="stat-label">In Queue</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{preparingOrders.length}</div>
          <div className="stat-label">Preparing</div>
        </div>
        <div className="stat-card ready">
          <div className="stat-value">{readyOrders.length}</div>
          <div className="stat-label">Ready</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => fetchOrders()} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Orders Grid */}
      <div className="orders-grid-container">
        {/* Pending Payment Section */}
        <div className="order-section">
          <h2 className="section-title pending">
            💳 Pending Payment ({pendingPaymentOrders.length})
          </h2>
          <div className="orders-column">
            {pendingPaymentOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onSelect={setSelectedOrder}
                onConfirmPayment={handleConfirmPayment}
                actionLoading={actionLoading}
              />
            ))}
            {pendingPaymentOrders.length === 0 && (
              <div className="empty-section">No pending payments</div>
            )}
          </div>
        </div>

        {/* In Queue Section */}
        <div className="order-section">
          <h2 className="section-title confirmed">
            📋 In Queue ({confirmedOrders.length})
          </h2>
          <div className="orders-column">
            {confirmedOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onSelect={setSelectedOrder}
                onUpdateStatus={handleUpdateStatus}
                actionLoading={actionLoading}
              />
            ))}
            {confirmedOrders.length === 0 && (
              <div className="empty-section">No orders in queue</div>
            )}
          </div>
        </div>

        {/* Preparing Section */}
        <div className="order-section">
          <h2 className="section-title preparing">
            👨‍🍳 Preparing ({preparingOrders.length})
          </h2>
          <div className="orders-column">
            {preparingOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onSelect={setSelectedOrder}
                onUpdateStatus={handleUpdateStatus}
                actionLoading={actionLoading}
              />
            ))}
            {preparingOrders.length === 0 && (
              <div className="empty-section">No orders preparing</div>
            )}
          </div>
        </div>

        {/* Ready Section */}
        <div className="order-section">
          <h2 className="section-title ready">
            🔔 Ready for Pickup ({readyOrders.length})
          </h2>
          <div className="orders-column">
            {readyOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onSelect={setSelectedOrder}
                onComplete={handleCompleteOrder}
                actionLoading={actionLoading}
              />
            ))}
            {readyOrders.length === 0 && (
              <div className="empty-section">No orders ready</div>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onConfirmPayment={handleConfirmPayment}
          onUpdateStatus={handleUpdateStatus}
          onComplete={handleCompleteOrder}
          loading={actionLoading}
        />
      )}
    </div>
  );
};

// Order Card Component
interface OrderCardProps {
  order: Order;
  onSelect: (order: Order) => void;
  onConfirmPayment?: (orderId: number) => void;
  onUpdateStatus?: (orderId: number, status: OrderStatus) => void;
  onComplete?: (orderId: number) => void;
  actionLoading: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onSelect,
  onConfirmPayment,
  onUpdateStatus,
  onComplete,
  actionLoading
}) => {
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  return (
    <div className="order-card" onClick={() => onSelect(order)}>
      <div className="order-card-header">
        <div className="queue-badge">#{order.queue_number}</div>
        <div className="order-time">{getTimeAgo(order.created_at)}</div>
      </div>

      <div className="order-customer">
        <strong>{order.user?.name || 'Customer'}</strong>
      </div>

      <div className="order-items-preview">
        {order.order_items.slice(0, 2).map((item, idx) => (
          <div key={idx} className="item-preview">
            {item.quantity}× {item.menu_item.name}
          </div>
        ))}
        {order.order_items.length > 2 && (
          <div className="more-items">+{order.order_items.length - 2} more</div>
        )}
      </div>

      <div className="order-card-footer">
        <div className="order-total">${order.total_amount.toFixed(2)}</div>
        <div className="pickup-time">
          🕐 {formatTime(order.pickup_window_start)}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions" onClick={(e) => e.stopPropagation()}>
        {onConfirmPayment && order.payment_status === 'PENDING' && (
          <button
            onClick={() => onConfirmPayment(order.id)}
            disabled={actionLoading}
            className="action-btn confirm"
          >
            ✓ Confirm Payment
          </button>
        )}
        {onUpdateStatus && order.status === 'CONFIRMED' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'PREPARING')}
            disabled={actionLoading}
            className="action-btn start"
          >
            👨‍🍳 Start Preparing
          </button>
        )}
        {onUpdateStatus && order.status === 'PREPARING' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'READY')}
            disabled={actionLoading}
            className="action-btn ready"
          >
            🔔 Mark Ready
          </button>
        )}
        {onComplete && order.status === 'READY' && (
          <button
            onClick={() => onComplete(order.id)}
            disabled={actionLoading}
            className="action-btn complete"
          >
            ✓ Complete
          </button>
        )}
      </div>
    </div>
  );
};

// Order Detail Modal Component
interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onConfirmPayment: (orderId: number) => void;
  onUpdateStatus: (orderId: number, status: OrderStatus) => void;
  onComplete: (orderId: number) => void;
  loading: boolean;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onConfirmPayment,
  onUpdateStatus,
  onComplete,
  loading
}) => {
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order #{order.id.toString().padStart(6, '0')}</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div className="modal-body">
          <div className="detail-section">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> {order.user?.name}</p>
            <p><strong>Queue Number:</strong> #{order.queue_number}</p>
            <p><strong>Pickup Window:</strong> {formatTime(order.pickup_window_start)} - {formatTime(order.pickup_window_end)}</p>
          </div>

          <div className="detail-section">
            <h3>Order Items</h3>
            {order.order_items.map((item) => (
              <div key={item.id} className="modal-item">
                <div className="modal-item-info">
                  <strong>{item.quantity}× {item.menu_item.name}</strong>
                  {item.special_requests && (
                    <div className="special-note">Note: {item.special_requests}</div>
                  )}
                </div>
                <div className="modal-item-price">
                  ${(item.unit_price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {order.special_instructions && (
            <div className="detail-section special-instructions">
              <h3>Special Instructions</h3>
              <p>{order.special_instructions}</p>
            </div>
          )}

          <div className="detail-section total-section">
            <h3>Total Amount</h3>
            <div className="total-amount">${order.total_amount.toFixed(2)}</div>
          </div>
        </div>

        <div className="modal-actions">
          {order.payment_status === 'PENDING' && (
            <button
              onClick={() => onConfirmPayment(order.id)}
              disabled={loading}
              className="modal-action-btn confirm"
            >
              Confirm Payment
            </button>
          )}
          {order.status === 'CONFIRMED' && order.payment_status !== 'PENDING' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'PREPARING')}
              disabled={loading}
              className="modal-action-btn start"
            >
              Start Preparing
            </button>
          )}
          {order.status === 'PREPARING' && (
            <button
              onClick={() => onUpdateStatus(order.id, 'READY')}
              disabled={loading}
              className="modal-action-btn ready"
            >
              Mark as Ready
            </button>
          )}
          {order.status === 'READY' && (
            <button
              onClick={() => onComplete(order.id)}
              disabled={loading}
              className="modal-action-btn complete"
            >
              Complete Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StallOwnerDashboard;
