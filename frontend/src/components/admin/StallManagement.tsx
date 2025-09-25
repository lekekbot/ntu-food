import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminStallsApi, adminUsersApi } from '../../services/adminApi';
import './AdminStyles.css';

interface Stall {
  id: number;
  name: string;
  location: string;
  opening_time: string | null;
  closing_time: string | null;
  avg_prep_time: number;
  max_concurrent_orders: number;
  description: string | null;
  cuisine_type: string | null;
  image_url: string | null;
  is_open: boolean;
  rating: number;
  owner_id: number | null;
}

const StallManagement: React.FC = () => {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStall, setEditingStall] = useState<Stall | null>(null);
  const [creatingStall, setCreatingStall] = useState(false);
  const [newStall, setNewStall] = useState<Partial<Stall>>({
    name: '',
    location: '',
    avg_prep_time: 15,
    max_concurrent_orders: 10,
    is_open: true,
    rating: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadStalls();
  }, []);

  const loadStalls = async () => {
    try {
      const data = await adminStallsApi.getAll();
      setStalls(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load stalls:', error);
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newStall.name || !newStall.location) {
      alert('Please fill in required fields: Name and Location');
      return;
    }

    try {
      await adminStallsApi.create(newStall);
      alert('✅ Stall created successfully in database! Students can now see and order from this stall.');
      setCreatingStall(false);
      setNewStall({
        name: '',
        location: '',
        avg_prep_time: 15,
        max_concurrent_orders: 10,
        is_open: true,
        rating: 0
      });
      loadStalls();
    } catch (error: any) {
      alert('❌ Failed to create stall: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEdit = (stall: Stall) => {
    setEditingStall({ ...stall });
  };

  const handleSave = async () => {
    if (!editingStall) return;

    try {
      await adminStallsApi.update(editingStall.id, editingStall);
      alert('✅ Stall updated in database! Changes are immediately visible to students.');
      setEditingStall(null);
      loadStalls();
    } catch (error: any) {
      alert('❌ Failed to update stall: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async (stallId: number, stallName: string) => {
    if (!confirm(`Are you sure you want to delete "${stallName}"? This will permanently remove the stall and all its menu items from the database.`)) {
      return;
    }

    try {
      await adminStallsApi.delete(stallId);
      alert('✅ Stall deleted from database! Students will no longer see this stall.');
      loadStalls();
    } catch (error: any) {
      alert('❌ Failed to delete stall: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleToggleOpen = async (stall: Stall) => {
    try {
      await adminStallsApi.update(stall.id, { is_open: !stall.is_open });
      alert(`✅ Stall ${!stall.is_open ? 'opened' : 'closed'} in database!`);
      loadStalls();
    } catch (error: any) {
      alert('❌ Failed to update stall: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading stalls...</div>;
  }

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <div className="admin-nav-brand">
          <h1>🏪 Stall Management</h1>
        </div>
        <div className="admin-nav-actions">
          <button onClick={() => setCreatingStall(true)} className="btn-primary">
            + Add New Stall
          </button>
          <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="admin-container">
        <div className="admin-content-full">
          <div className="cards-grid">
            {stalls.map((stall) => (
              <div key={stall.id} className="stall-card">
                <div className="stall-header">
                  <h3>{stall.name}</h3>
                  <span className={`status-badge ${stall.is_open ? 'status-active' : 'status-inactive'}`}>
                    {stall.is_open ? 'Open' : 'Closed'}
                  </span>
                </div>

                <div className="stall-info">
                  <p><strong>Location:</strong> {stall.location}</p>
                  <p><strong>Cuisine:</strong> {stall.cuisine_type || 'N/A'}</p>
                  <p><strong>Prep Time:</strong> {stall.avg_prep_time} min</p>
                  <p><strong>Max Orders:</strong> {stall.max_concurrent_orders}</p>
                  <p><strong>Rating:</strong> ⭐ {stall.rating.toFixed(1)}</p>
                  {stall.opening_time && stall.closing_time && (
                    <p><strong>Hours:</strong> {stall.opening_time} - {stall.closing_time}</p>
                  )}
                  {stall.description && (
                    <p className="stall-description">{stall.description}</p>
                  )}
                </div>

                <div className="stall-actions">
                  <button onClick={() => handleEdit(stall)} className="btn-edit">
                    ✏️ Edit
                  </button>
                  <button onClick={() => handleToggleOpen(stall)} className="btn-toggle">
                    {stall.is_open ? '🔒 Close' : '🔓 Open'}
                  </button>
                  <button onClick={() => handleDelete(stall.id, stall.name)} className="btn-delete">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {creatingStall && (
        <div className="modal-overlay" onClick={() => setCreatingStall(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Stall (Database Insert)</h2>
            <p className="modal-info">💾 New stall will be added to database and visible to students immediately</p>

            <div className="form-grid">
              <div className="form-group">
                <label>Name: *</label>
                <input
                  type="text"
                  value={newStall.name}
                  onChange={(e) => setNewStall({ ...newStall, name: e.target.value })}
                  placeholder="e.g., North Spine Food Court"
                />
              </div>

              <div className="form-group">
                <label>Location: *</label>
                <input
                  type="text"
                  value={newStall.location}
                  onChange={(e) => setNewStall({ ...newStall, location: e.target.value })}
                  placeholder="e.g., North Spine, Level 1"
                />
              </div>

              <div className="form-group">
                <label>Cuisine Type:</label>
                <input
                  type="text"
                  value={newStall.cuisine_type || ''}
                  onChange={(e) => setNewStall({ ...newStall, cuisine_type: e.target.value })}
                  placeholder="e.g., Chinese, Western, Indian"
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={newStall.description || ''}
                  onChange={(e) => setNewStall({ ...newStall, description: e.target.value })}
                  placeholder="Brief description of the stall"
                />
              </div>

              <div className="form-group">
                <label>Opening Time:</label>
                <input
                  type="time"
                  value={newStall.opening_time || ''}
                  onChange={(e) => setNewStall({ ...newStall, opening_time: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Closing Time:</label>
                <input
                  type="time"
                  value={newStall.closing_time || ''}
                  onChange={(e) => setNewStall({ ...newStall, closing_time: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Avg Prep Time (minutes):</label>
                <input
                  type="number"
                  value={newStall.avg_prep_time}
                  onChange={(e) => setNewStall({ ...newStall, avg_prep_time: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Max Concurrent Orders:</label>
                <input
                  type="number"
                  value={newStall.max_concurrent_orders}
                  onChange={(e) => setNewStall({ ...newStall, max_concurrent_orders: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Image URL:</label>
                <input
                  type="text"
                  value={newStall.image_url || ''}
                  onChange={(e) => setNewStall({ ...newStall, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newStall.is_open}
                    onChange={(e) => setNewStall({ ...newStall, is_open: e.target.checked })}
                  />
                  Open for orders
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleCreate} className="btn-save">
                💾 Create Stall in Database
              </button>
              <button onClick={() => setCreatingStall(false)} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingStall && (
        <div className="modal-overlay" onClick={() => setEditingStall(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Stall (Database Update)</h2>
            <p className="modal-info">💾 Changes will be saved to database and visible to students immediately</p>

            <div className="form-grid">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={editingStall.name}
                  onChange={(e) => setEditingStall({ ...editingStall, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Location:</label>
                <input
                  type="text"
                  value={editingStall.location}
                  onChange={(e) => setEditingStall({ ...editingStall, location: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Cuisine Type:</label>
                <input
                  type="text"
                  value={editingStall.cuisine_type || ''}
                  onChange={(e) => setEditingStall({ ...editingStall, cuisine_type: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value={editingStall.description || ''}
                  onChange={(e) => setEditingStall({ ...editingStall, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Opening Time:</label>
                <input
                  type="time"
                  value={editingStall.opening_time || ''}
                  onChange={(e) => setEditingStall({ ...editingStall, opening_time: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Closing Time:</label>
                <input
                  type="time"
                  value={editingStall.closing_time || ''}
                  onChange={(e) => setEditingStall({ ...editingStall, closing_time: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Avg Prep Time (minutes):</label>
                <input
                  type="number"
                  value={editingStall.avg_prep_time}
                  onChange={(e) => setEditingStall({ ...editingStall, avg_prep_time: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Max Concurrent Orders:</label>
                <input
                  type="number"
                  value={editingStall.max_concurrent_orders}
                  onChange={(e) => setEditingStall({ ...editingStall, max_concurrent_orders: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Rating:</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={editingStall.rating}
                  onChange={(e) => setEditingStall({ ...editingStall, rating: parseFloat(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Image URL:</label>
                <input
                  type="text"
                  value={editingStall.image_url || ''}
                  onChange={(e) => setEditingStall({ ...editingStall, image_url: e.target.value })}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editingStall.is_open}
                    onChange={(e) => setEditingStall({ ...editingStall, is_open: e.target.checked })}
                  />
                  Open for orders
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleSave} className="btn-save">
                💾 Save to Database
              </button>
              <button onClick={() => setEditingStall(null)} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StallManagement;