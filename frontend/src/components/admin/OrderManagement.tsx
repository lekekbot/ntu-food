import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminOrdersApi, adminStallsApi } from '../../services/adminApi';
import './AdminStyles.css';

interface Order {
  id: number;
  order_number: string;
  user_id: number;
  stall_id: number;
  status: string;
  total_amount: number;
  pickup_time: string | null;
  created_at: string;
  updated_at: string;
}

interface Stall {
  id: number;
  name: string;
}

const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterStall, setFilterStall] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadStalls();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [filterStatus, filterStall]);

  const loadStalls = async () => {
    try {
      const data = await adminStallsApi.getAll();
      setStalls(data);
    } catch (error) {
      console.error('Failed to load stalls:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const filters: any = {};
      if (filterStatus) filters.status = filterStatus;
      if (filterStall) filters.stall_id = parseInt(filterStall);

      const data = await adminOrdersApi.getAll(filters);
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await adminOrdersApi.updateStatus(orderId, newStatus);
      alert(`✅ Order status updated to ${newStatus} in database!`);
      loadOrders();
    } catch (error: any) {
      alert('❌ Failed to update order: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async (orderId: number, orderNumber: string) => {
    if (!confirm(`Delete order ${orderNumber}? This will permanently remove it from the database.`)) {
      return;
    }

    try {
      await adminOrdersApi.delete(orderId);
      alert('✅ Order deleted from database!');
      loadOrders();
    } catch (error: any) {
      alert('❌ Failed to delete order: ' + (error.response?.data?.detail || error.message));
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': '#FFA500',
      'preparing': '#2196F3',
      'ready': '#4CAF50',
      'completed': '#9E9E9E',
      'cancelled': '#F44336'
    };
    return colors[status.toLowerCase()] || '#000';
  };

  if (loading) {
    return <div className="admin-loading">Loading orders...</div>;
  }

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <div className="admin-nav-brand">
          <h1>📦 Order Management</h1>
        </div>
        <div className="admin-nav-actions">
          <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="admin-container">
        <div className="admin-content-full">
          <div className="filters-bar">
            <div className="filter-group">
              <label>Filter by Status:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Filter by Stall:</label>
              <select value={filterStall} onChange={(e) => setFilterStall(e.target.value)}>
                <option value="">All Stalls</option>
                {stalls.map((stall) => (
                  <option key={stall.id} value={stall.id}>
                    {stall.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-stats">
              <strong>Total: {orders.length} orders</strong>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Stall</th>
                  <th>User ID</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Pickup Time</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.order_number}</strong>
                    </td>
                    <td>{stalls.find(s => s.id === order.stall_id)?.name || `Stall #${order.stall_id}`}</td>
                    <td>#{order.user_id}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="price">${order.total_amount.toFixed(2)}</td>
                    <td>
                      {order.pickup_time
                        ? new Date(order.pickup_time).toLocaleString()
                        : 'ASAP'}
                    </td>
                    <td>{new Date(order.created_at).toLocaleString()}</td>
                    <td>
                      <div className="action-buttons">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className="status-select"
                          title="Update status in database"
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDelete(order.id, order.order_number)}
                          className="btn-delete"
                          title="Delete from database"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="info-box">
            <h3>💾 Database Persistence Information</h3>
            <ul>
              <li>✅ All status updates are immediately saved to the database</li>
              <li>✅ Changes are synchronized with queue entries in real-time</li>
              <li>✅ Students see updated order status immediately</li>
              <li>✅ Deleting an order removes it permanently from the database</li>
              <li>✅ All changes persist across app restarts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;