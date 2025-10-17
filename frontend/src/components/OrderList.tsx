import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import notify from '../utils/notifications';
import './OrderList.css';

type OrderStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
type TabType = 'active' | 'past';

interface Order {
  id: number;
  stall_id: number;
  stall_name: string;
  queue_number: number;
  status: OrderStatus;
  payment_status: string;
  total_amount: number;
  created_at: string;
  pickup_window_start: string;
  pickup_window_end: string;
  order_items: any[];
}

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [notifiedOrders, setNotifiedOrders] = useState<Set<number>>(new Set());

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchOrders();
    startAutoRefresh();

    return () => {
      stopAutoRefresh();
    };
  }, []);

  // Notify when orders become ready
  useEffect(() => {
    orders.forEach(order => {
      if (order.status === 'READY' && !notifiedOrders.has(order.id)) {
        notify.orderReady(order.queue_number);
        setNotifiedOrders(prev => new Set(prev).add(order.id));
      }
    });
  }, [orders]);

  const startAutoRefresh = () => {
    // Auto-refresh every 30 seconds
    refreshIntervalRef.current = setInterval(() => {
      fetchOrders(true); // Silent refresh
    }, 30000);
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

      const response = await ordersAPI.getAll();
      setOrders(response.data);
      setLastRefresh(new Date());
      setError('');
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      if (!silent) {
        setError('Failed to load orders. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOrderClick = (order: Order) => {
    navigate(`/order-tracking/${order.id}`, {
      state: { order }
    });
  };

  const getStatusInfo = (status: OrderStatus): { color: string; bg: string; icon: string; label: string } => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return { color: '#92400e', bg: '#fef3c7', icon: '💳', label: 'Pending Payment' };
      case 'CONFIRMED':
        return { color: '#1e40af', bg: '#dbeafe', icon: '✓', label: 'Confirmed' };
      case 'PREPARING':
        return { color: '#ea580c', bg: '#fed7aa', icon: '👨‍🍳', label: 'Preparing' };
      case 'READY':
        return { color: '#166534', bg: '#bbf7d0', icon: '🔔', label: 'Ready for Pickup' };
      case 'COMPLETED':
        return { color: '#065f46', bg: '#d1fae5', icon: '✓', label: 'Completed' };
      case 'CANCELLED':
        return { color: '#dc2626', bg: '#fecaca', icon: '✕', label: 'Cancelled' };
      default:
        return { color: '#64748b', bg: '#f1f5f9', icon: '?', label: 'Unknown' };
    }
  };

  const formatPickupTime = (startTime: string, endTime: string): string => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const getTimeUntilPickup = (pickupStart: string): string => {
    const now = new Date();
    const pickup = new Date(pickupStart);
    const diffMs = pickup.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 0) return 'Pickup time passed';
    if (diffMins < 5) return 'Pickup now!';
    if (diffMins < 60) return `${diffMins} mins until pickup`;

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m until pickup`;
  };

  const filterOrders = (orders: Order[]): Order[] => {
    if (activeTab === 'active') {
      return orders.filter(order =>
        order.status !== 'COMPLETED' && order.status !== 'CANCELLED'
      );
    } else {
      return orders.filter(order =>
        order.status === 'COMPLETED' || order.status === 'CANCELLED'
      );
    }
  };

  const filteredOrders = filterOrders(orders);

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
          <div className="user-actions">
            <span className="user-name">Hi, {user?.name}!</span>
            <button onClick={() => navigate('/stalls')} className="btn-stalls">
              Browse Stalls
            </button>
            <button onClick={logout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="order-list-main">
        <div className="order-list-content">
          {/* Tab Navigation */}
          <div className="tabs-container">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveTab('active')}
              >
                Active Orders
                {filterOrders(orders).filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length > 0 && (
                  <span className="tab-badge">
                    {filterOrders(orders).filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length}
                  </span>
                )}
              </button>
              <button
                className={`tab ${activeTab === 'past' ? 'active' : ''}`}
                onClick={() => setActiveTab('past')}
              >
                Past Orders
              </button>
            </div>

            <div className="refresh-info">
              {refreshing ? (
                <span className="refreshing">
                  <span className="refresh-spinner"></span> Updating...
                </span>
              ) : (
                <span className="last-refresh">
                  Updated {formatTimeAgo(lastRefresh.toISOString())}
                </span>
              )}
              <button onClick={() => fetchOrders()} className="btn-refresh">
                🔄
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => fetchOrders()} className="retry-button">
                Retry
              </button>
            </div>
          )}

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <div className="no-orders-icon">
                {activeTab === 'active' ? '🍽️' : '📦'}
              </div>
              <h2>
                {activeTab === 'active' ? 'No Active Orders' : 'No Past Orders'}
              </h2>
              <p>
                {activeTab === 'active'
                  ? "You don't have any active orders. Start ordering from our food stalls!"
                  : "Your completed and cancelled orders will appear here."}
              </p>
              {activeTab === 'active' && (
                <button onClick={() => navigate('/stalls')} className="browse-button">
                  Browse Food Stalls
                </button>
              )}
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <div
                    key={order.id}
                    className={`order-card ${order.status === 'READY' ? 'ready-pulse' : ''}`}
                    onClick={() => handleOrderClick(order)}
                  >
                    {/* Order Header */}
                    <div className="order-card-header">
                      <div className="order-id-section">
                        <span className="order-label">Order</span>
                        <span className="order-id">#{order.id.toString().padStart(6, '0')}</span>
                      </div>
                      <div
                        className="status-badge"
                        style={{
                          backgroundColor: statusInfo.bg,
                          color: statusInfo.color
                        }}
                      >
                        <span className="status-icon">{statusInfo.icon}</span>
                        <span>{statusInfo.label}</span>
                      </div>
                    </div>

                    {/* Stall Info */}
                    <div className="order-stall">
                      <h3>{order.stall_name}</h3>
                      <div className="queue-badge">
                        Queue #{order.queue_number}
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="order-details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Amount</span>
                        <span className="detail-value">${order.total_amount.toFixed(2)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Items</span>
                        <span className="detail-value">{order.order_items?.length || 0}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Ordered</span>
                        <span className="detail-value">{formatTimeAgo(order.created_at)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Pickup</span>
                        <span className="detail-value">
                          {formatPickupTime(order.pickup_window_start, order.pickup_window_end)}
                        </span>
                      </div>
                    </div>

                    {/* Pickup Timer for Active Orders */}
                    {activeTab === 'active' && order.status !== 'PENDING_PAYMENT' && (
                      <div className="pickup-timer">
                        ⏰ {getTimeUntilPickup(order.pickup_window_start)}
                      </div>
                    )}

                    {/* Payment Reminder */}
                    {order.payment_status === 'PENDING' && (
                      <div className="payment-reminder">
                        💳 Payment pending - Complete payment to proceed
                      </div>
                    )}

                    {/* Ready Alert */}
                    {order.status === 'READY' && (
                      <div className="ready-alert">
                        🔔 Your order is ready! Please collect it soon.
                      </div>
                    )}

                    {/* Click to View */}
                    <div className="view-details-arrow">
                      View Details →
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrderList;
