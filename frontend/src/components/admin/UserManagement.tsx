import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminUsersApi } from '../../services/adminApi';
import './AdminStyles.css';

interface User {
  id: number;
  ntu_email: string;
  student_id: string;
  name: string;
  phone: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState<string>('');
  const [filterActive, setFilterActive] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, [filterRole, filterActive]);

  const loadUsers = async () => {
    try {
      const filters: any = {};
      if (filterRole) filters.role = filterRole;
      if (filterActive !== '') filters.is_active = filterActive === 'true';

      const data = await adminUsersApi.getAll(filters);
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load users:', error);
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser({ ...user });
  };

  const handleSave = async () => {
    if (!editingUser) return;

    try {
      await adminUsersApi.update(editingUser.id, {
        name: editingUser.name,
        phone: editingUser.phone,
        is_active: editingUser.is_active,
        is_verified: editingUser.is_verified,
        role: editingUser.role
      });

      alert('✅ User updated successfully in database!');
      setEditingUser(null);
      loadUsers();
    } catch (error: any) {
      alert('❌ Failed to update user: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This will permanently remove them from the database.`)) {
      return;
    }

    try {
      await adminUsersApi.delete(userId);
      alert('✅ User deleted from database!');
      loadUsers();
    } catch (error: any) {
      alert('❌ Failed to delete user: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      await adminUsersApi.update(user.id, { is_active: !user.is_active });
      alert(`✅ User ${!user.is_active ? 'activated' : 'deactivated'} in database!`);
      loadUsers();
    } catch (error: any) {
      alert('❌ Failed to update user: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading users...</div>;
  }

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <div className="admin-nav-brand">
          <h1>👥 User Management</h1>
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
              <label>Filter by Role:</label>
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="stall_owner">Stall Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Filter by Status:</label>
              <select value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="filter-stats">
              <strong>Total: {users.length} users</strong>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Student ID</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Verified</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.ntu_email}</td>
                    <td>{user.student_id}</td>
                    <td>{user.phone}</td>
                    <td>
                      <span className={`role-badge role-${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {user.is_verified ? '✓' : '✗'}
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(user)}
                          className="btn-edit"
                          title="Edit user (updates database)"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className="btn-toggle"
                          title={`${user.is_active ? 'Deactivate' : 'Activate'} (updates database)`}
                        >
                          {user.is_active ? '🔒' : '🔓'}
                        </button>
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(user.id, user.name)}
                            className="btn-delete"
                            title="Delete from database"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Edit User (Database Update)</h2>
            <p className="modal-info">💾 Changes will be saved directly to the database</p>

            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Phone:</label>
              <input
                type="text"
                value={editingUser.phone}
                onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Role:</label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="stall_owner">Stall Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={editingUser.is_active}
                  onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })}
                />
                Active
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={editingUser.is_verified}
                  onChange={(e) => setEditingUser({ ...editingUser, is_verified: e.target.checked })}
                />
                Verified
              </label>
            </div>

            <div className="modal-actions">
              <button onClick={handleSave} className="btn-save">
                💾 Save to Database
              </button>
              <button onClick={() => setEditingUser(null)} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;