import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAnalyticsApi } from '../../services/adminApi';
import './AdminDashboard.css';

interface DashboardStats {
  total_users: number;
  active_users: number;
  total_stalls: number;
  total_orders: number;
  active_orders: number;
  total_revenue: number;
  today_orders: number;
  today_revenue: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [popularItems, setPopularItems] = useState<any[]>([]);
  const [stallPerformance, setStallPerformance] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, popularData, performanceData, activityData] = await Promise.all([
        adminAnalyticsApi.getDashboard(),
        adminAnalyticsApi.getPopularItems(10),
        adminAnalyticsApi.getStallPerformance(),
        adminAnalyticsApi.getRecentActivity(15)
      ]);

      setStats(statsData);
      setPopularItems(popularData);
      setStallPerformance(performanceData);
      setRecentActivity(activityData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  if (loading) {
    return <div className="admin-loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <div className="admin-nav-brand">
          <h1>🍽️ NTU Food Admin</h1>
        </div>
        <div className="admin-nav-user">
          <span>Welcome, {adminUser.name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="admin-container">
        <aside className="admin-sidebar">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={activeTab === 'accounts' ? 'active' : ''}
            onClick={() => navigate('/admin/accounts')}
          >
            👤 All Accounts
          </button>
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => navigate('/admin/users')}
          >
            👥 User Management
          </button>
          <button
            className={activeTab === 'stalls' ? 'active' : ''}
            onClick={() => navigate('/admin/stalls')}
          >
            🏪 Stalls
          </button>
          <button
            className={activeTab === 'menu' ? 'active' : ''}
            onClick={() => navigate('/admin/menu')}
          >
            📋 Menu Items
          </button>
          <button
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => navigate('/admin/orders')}
          >
            📦 Orders
          </button>
        </aside>

        <main className="admin-content">
          {stats && (
            <>
              <section className="stats-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p className="stat-number">{stats.total_users}</p>
                  <span className="stat-detail">{stats.active_users} active</span>
                </div>

                <div className="stat-card">
                  <h3>Total Stalls</h3>
                  <p className="stat-number">{stats.total_stalls}</p>
                </div>

                <div className="stat-card">
                  <h3>Total Orders</h3>
                  <p className="stat-number">{stats.total_orders}</p>
                  <span className="stat-detail">{stats.active_orders} active</span>
                </div>

                <div className="stat-card">
                  <h3>Total Revenue</h3>
                  <p className="stat-number">${stats.total_revenue.toFixed(2)}</p>
                </div>

                <div className="stat-card highlight">
                  <h3>Today's Orders</h3>
                  <p className="stat-number">{stats.today_orders}</p>
                </div>

                <div className="stat-card highlight">
                  <h3>Today's Revenue</h3>
                  <p className="stat-number">${stats.today_revenue.toFixed(2)}</p>
                </div>
              </section>

              <div className="analytics-grid">
                <section className="analytics-card">
                  <h2>🔥 Popular Items</h2>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Stall</th>
                          <th>Orders</th>
                          <th>Qty Sold</th>
                          <th>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {popularItems.map((item, index) => (
                          <tr key={index}>
                            <td>{item.name}</td>
                            <td>{item.stall_name}</td>
                            <td>{item.order_count}</td>
                            <td>{item.total_quantity}</td>
                            <td>${item.total_revenue.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="analytics-card">
                  <h2>🏪 Stall Performance</h2>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Stall</th>
                          <th>Orders</th>
                          <th>Revenue</th>
                          <th>Avg Order</th>
                          <th>Customers</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stallPerformance.map((stall, index) => (
                          <tr key={index}>
                            <td>{stall.stall_name}</td>
                            <td>{stall.total_orders}</td>
                            <td>${stall.total_revenue.toFixed(2)}</td>
                            <td>${stall.avg_order_value.toFixed(2)}</td>
                            <td>{stall.unique_customers}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <section className="analytics-card">
                <h2>📝 Recent Activity</h2>
                <div className="activity-list">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-info">
                        <strong>Order #{activity.order_number}</strong>
                        <span>{activity.user_name} ordered from {activity.stall_name}</span>
                      </div>
                      <div className="activity-meta">
                        <span className={`status-badge status-${activity.status.toLowerCase()}`}>
                          {activity.status}
                        </span>
                        <span className="activity-amount">${activity.total_amount.toFixed(2)}</span>
                        <span className="activity-time">
                          {new Date(activity.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;