import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminUsersApi } from '../../services/adminApi';
import './AdminStyles.css';
import './AllAccounts.css';

interface User {
  id: number;
  ntu_email: string;
  student_id: string;
  name: string;
  phone: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  dietary_preferences?: string;
  created_at: string;
  updated_at?: string;
}

interface TestCredentials {
  email: string;
  password: string;
  role: string;
  name: string;
}

const AllAccounts: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterVerified, setFilterVerified] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showCredentials, setShowCredentials] = useState(false);
  const navigate = useNavigate();

  // Test credentials for development
  const testCredentials: TestCredentials[] = [
    {
      email: 'admin@ntu.edu.sg',
      password: 'admin123',
      role: 'Admin',
      name: 'System Administrator'
    },
    {
      email: 'test.student@e.ntu.edu.sg',
      password: 'testpassword123',
      role: 'Student',
      name: 'Test Student'
    },
    {
      email: 'john.tan@e.ntu.edu.sg',
      password: 'password123',
      role: 'Student',
      name: 'John Tan Wei Ming'
    },
    {
      email: 'alice.lim@e.ntu.edu.sg',
      password: 'password123',
      role: 'Student',
      name: 'Alice Lim Mei Ling'
    }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, filterRole, filterStatus, filterVerified, sortColumn, sortDirection]);

  const loadUsers = async () => {
    try {
      const data = await adminUsersApi.getAll({});
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load users:', error);
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.ntu_email.toLowerCase().includes(term) ||
        user.student_id.toLowerCase().includes(term) ||
        (user.phone && user.phone.includes(term))
      );
    }

    // Role filter
    if (filterRole) {
      filtered = filtered.filter(user => user.role.toLowerCase() === filterRole.toLowerCase());
    }

    // Status filter
    if (filterStatus !== '') {
      filtered = filtered.filter(user => user.is_active === (filterStatus === 'true'));
    }

    // Verified filter
    if (filterVerified !== '') {
      filtered = filtered.filter(user => user.is_verified === (filterVerified === 'true'));
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortColumn as keyof User];
      let bVal: any = b[sortColumn as keyof User];

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await adminUsersApi.update(user.id, { is_active: !user.is_active });
      alert(`✅ User ${!user.is_active ? 'activated' : 'deactivated'}!`);
      loadUsers();
    } catch (error: any) {
      alert('❌ Failed to update user: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async (userId: number, userName: string, userRole: string) => {
    if (userRole.toLowerCase() === 'admin') {
      alert('⚠️ Cannot delete admin users!');
      return;
    }

    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    try {
      await adminUsersApi.delete(userId);
      alert('✅ User deleted successfully!');
      loadUsers();
    } catch (error: any) {
      alert('❌ Failed to delete user: ' + (error.response?.data?.detail || error.message));
    }
  };

  const exportToCSV = () => {
    const headers = [
      'ID',
      'Name',
      'Email',
      'Student ID',
      'Phone',
      'Role',
      'Status',
      'Verified',
      'Dietary Preferences',
      'Created At',
      'Updated At'
    ];

    const csvData = filteredUsers.map(user => [
      user.id,
      user.name,
      user.ntu_email,
      user.student_id,
      user.phone,
      user.role,
      user.is_active ? 'Active' : 'Inactive',
      user.is_verified ? 'Yes' : 'No',
      user.dietary_preferences || 'None',
      new Date(user.created_at).toLocaleString(),
      user.updated_at ? new Date(user.updated_at).toLocaleString() : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ntu-food-accounts-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('✅ Copied to clipboard!');
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role.toLowerCase() === 'admin').length,
    students: users.filter(u => u.role.toLowerCase() === 'student').length,
    stallOwners: users.filter(u => u.role.toLowerCase() === 'stall_owner').length,
    active: users.filter(u => u.is_active).length,
    verified: users.filter(u => u.is_verified).length,
    recent: users.filter(u => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(u.created_at) > weekAgo;
    }).length
  };

  if (loading) {
    return <div className="admin-loading">Loading accounts...</div>;
  }

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <div className="admin-nav-brand">
          <h1>👤 All Accounts - Database Viewer</h1>
        </div>
        <div className="admin-nav-actions">
          <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="admin-container">
        <div className="admin-content-full">
          {/* Testing Mode Banner */}
          <div className="testing-banner">
            <strong>⚠️ TESTING MODE - Development Only</strong>
            <p>This page shows complete account information for testing purposes.</p>
            <button
              onClick={() => setShowCredentials(!showCredentials)}
              className="btn-toggle-creds"
            >
              {showCredentials ? '🔒 Hide' : '🔓 Show'} Test Credentials
            </button>
          </div>

          {/* Test Credentials Display */}
          {showCredentials && (
            <div className="credentials-panel">
              <h3>🔑 Test Account Credentials</h3>
              <div className="credentials-grid">
                {testCredentials.map((cred, index) => (
                  <div key={index} className="credential-card">
                    <div className="cred-role">{cred.role}</div>
                    <div className="cred-name">{cred.name}</div>
                    <div className="cred-detail">
                      <strong>Email:</strong>
                      <span>{cred.email}</span>
                      <button
                        onClick={() => copyToClipboard(cred.email)}
                        className="btn-copy"
                        title="Copy email"
                      >
                        📋
                      </button>
                    </div>
                    <div className="cred-detail">
                      <strong>Password:</strong>
                      <code>{cred.password}</code>
                      <button
                        onClick={() => copyToClipboard(cred.password)}
                        className="btn-copy"
                        title="Copy password"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics Dashboard */}
          <div className="accounts-stats">
            <div className="stat-box">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">{stats.total}</div>
                <div className="stat-label">Total Accounts</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">👑</div>
              <div className="stat-content">
                <div className="stat-value">{stats.admins}</div>
                <div className="stat-label">Admins</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">🎓</div>
              <div className="stat-content">
                <div className="stat-value">{stats.students}</div>
                <div className="stat-label">Students</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">🏪</div>
              <div className="stat-content">
                <div className="stat-value">{stats.stallOwners}</div>
                <div className="stat-label">Stall Owners</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{stats.active}</div>
                <div className="stat-label">Active Users</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">✔️</div>
              <div className="stat-content">
                <div className="stat-value">{stats.verified}</div>
                <div className="stat-label">Verified</div>
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-icon">🆕</div>
              <div className="stat-content">
                <div className="stat-value">{stats.recent}</div>
                <div className="stat-label">Last 7 Days</div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="accounts-controls">
            <div className="search-box">
              <input
                type="text"
                placeholder="🔍 Search by name, email, student ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filters-row">
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="filter-select">
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="student">Student</option>
                <option value="stall_owner">Stall Owner</option>
              </select>

              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <select value={filterVerified} onChange={(e) => setFilterVerified(e.target.value)} className="filter-select">
                <option value="">All Verification</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>

              <button onClick={exportToCSV} className="btn-export" title="Export to CSV">
                📊 Export CSV
              </button>

              <button onClick={loadUsers} className="btn-refresh" title="Refresh data">
                🔄 Refresh
              </button>
            </div>

            <div className="results-count">
              Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> accounts
            </div>
          </div>

          {/* Accounts Table */}
          <div className="table-container">
            <table className="accounts-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')} className="sortable">
                    ID {sortColumn === 'id' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('name')} className="sortable">
                    Name {sortColumn === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('ntu_email')} className="sortable">
                    Email {sortColumn === 'ntu_email' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('student_id')} className="sortable">
                    Student ID {sortColumn === 'student_id' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Phone</th>
                  <th onClick={() => handleSort('role')} className="sortable">
                    Role {sortColumn === 'role' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('is_active')} className="sortable">
                    Status {sortColumn === 'is_active' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSort('is_verified')} className="sortable">
                    Verified {sortColumn === 'is_verified' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Dietary</th>
                  <th onClick={() => handleSort('created_at')} className="sortable">
                    Created {sortColumn === 'created_at' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="no-data">
                      No accounts found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className={!user.is_active ? 'row-inactive' : ''}>
                      <td>{user.id}</td>
                      <td className="cell-name">{user.name}</td>
                      <td className="cell-email">{user.ntu_email}</td>
                      <td>{user.student_id}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span className={`role-badge role-${user.role.toLowerCase()}`}>
                          {user.role === 'admin' && '👑 '}
                          {user.role === 'student' && '🎓 '}
                          {user.role === 'stall_owner' && '🏪 '}
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                          {user.is_active ? '✅ Active' : '❌ Inactive'}
                        </span>
                      </td>
                      <td>
                        <span className={`verify-badge ${user.is_verified ? 'verified' : 'unverified'}`}>
                          {user.is_verified ? '✔️ Yes' : '❌ No'}
                        </span>
                      </td>
                      <td className="cell-dietary">
                        {user.dietary_preferences || <span className="text-muted">None</span>}
                      </td>
                      <td className="cell-date">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => navigate(`/admin/users`)}
                            className="btn-action btn-edit"
                            title="Edit user"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleToggleActive(user)}
                            className="btn-action btn-toggle"
                            title={user.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {user.is_active ? '🔒' : '🔓'}
                          </button>
                          {user.role.toLowerCase() !== 'admin' && (
                            <button
                              onClick={() => handleDelete(user.id, user.name, user.role)}
                              className="btn-action btn-delete"
                              title="Delete user"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllAccounts;
