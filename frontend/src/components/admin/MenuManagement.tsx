import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminMenuApi, adminStallsApi } from '../../services/adminApi';
import './AdminStyles.css';

interface MenuItem {
  id: number;
  stall_id: number;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  is_available: boolean;
  preparation_time: number;
}

interface Stall {
  id: number;
  name: string;
}

const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStall, setSelectedStall] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [creatingItem, setCreatingItem] = useState(false);
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    price: 0,
    is_available: true,
    preparation_time: 10,
    stall_id: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadStalls();
  }, []);

  useEffect(() => {
    if (selectedStall) {
      loadMenuItems(selectedStall);
    } else {
      loadMenuItems();
    }
  }, [selectedStall]);

  const loadStalls = async () => {
    try {
      const data = await adminStallsApi.getAll();
      setStalls(data);
    } catch (error) {
      console.error('Failed to load stalls:', error);
    }
  };

  const loadMenuItems = async (stallId?: number) => {
    try {
      const data = await adminMenuApi.getAll(stallId);
      setMenuItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load menu items:', error);
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newItem.name || !newItem.stall_id || newItem.price === undefined) {
      alert('Please fill in required fields: Name, Stall, and Price');
      return;
    }

    try {
      await adminMenuApi.create(newItem);
      alert('✅ Menu item created in database! Students can now order this item.');
      setCreatingItem(false);
      setNewItem({
        name: '',
        price: 0,
        is_available: true,
        preparation_time: 10,
        stall_id: selectedStall || 0
      });
      loadMenuItems(selectedStall || undefined);
    } catch (error: any) {
      alert('❌ Failed to create menu item: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem({ ...item });
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      await adminMenuApi.update(editingItem.id, editingItem);
      alert('✅ Menu item updated in database! Changes visible to students immediately.');
      setEditingItem(null);
      loadMenuItems(selectedStall || undefined);
    } catch (error: any) {
      alert('❌ Failed to update menu item: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleDelete = async (itemId: number, itemName: string) => {
    if (!confirm(`Delete "${itemName}"? This will permanently remove it from the database.`)) {
      return;
    }

    try {
      await adminMenuApi.delete(itemId);
      alert('✅ Menu item deleted from database! Students will no longer see this item.');
      loadMenuItems(selectedStall || undefined);
    } catch (error: any) {
      alert('❌ Failed to delete menu item: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await adminMenuApi.update(item.id, { is_available: !item.is_available });
      alert(`✅ Item ${!item.is_available ? 'enabled' : 'disabled'} in database!`);
      loadMenuItems(selectedStall || undefined);
    } catch (error: any) {
      alert('❌ Failed to update menu item: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading menu items...</div>;
  }

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <div className="admin-nav-brand">
          <h1>📋 Menu Management</h1>
        </div>
        <div className="admin-nav-actions">
          <button onClick={() => setCreatingItem(true)} className="btn-primary">
            + Add Menu Item
          </button>
          <button onClick={() => navigate('/admin/dashboard')} className="back-btn">
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="admin-container">
        <div className="admin-content-full">
          <div className="filters-bar">
            <div className="filter-group">
              <label>Filter by Stall:</label>
              <select
                value={selectedStall || ''}
                onChange={(e) => setSelectedStall(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">All Stalls</option>
                {stalls.map((stall) => (
                  <option key={stall.id} value={stall.id}>
                    {stall.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-stats">
              <strong>Total: {menuItems.length} items</strong>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Stall</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Prep Time</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{stalls.find(s => s.id === item.stall_id)?.name}</td>
                    <td>
                      <div className="item-name">
                        {item.name}
                        {item.description && (
                          <small className="item-desc">{item.description}</small>
                        )}
                      </div>
                    </td>
                    <td>{item.category || '-'}</td>
                    <td className="price">${item.price.toFixed(2)}</td>
                    <td>{item.preparation_time} min</td>
                    <td>
                      <span className={`status-badge ${item.is_available ? 'status-active' : 'status-inactive'}`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn-edit"
                          title="Edit (updates database)"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          className="btn-toggle"
                          title={`${item.is_available ? 'Disable' : 'Enable'} (updates database)`}
                        >
                          {item.is_available ? '🔒' : '🔓'}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
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
        </div>
      </div>

      {creatingItem && (
        <div className="modal-overlay" onClick={() => setCreatingItem(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>Create Menu Item (Database Insert)</h2>
            <p className="modal-info">💾 New item will be added to database and available to students immediately</p>

            <div className="form-grid">
              <div className="form-group">
                <label>Stall: *</label>
                <select
                  value={newItem.stall_id}
                  onChange={(e) => setNewItem({ ...newItem, stall_id: parseInt(e.target.value) })}
                >
                  <option value={0}>Select Stall</option>
                  {stalls.map((stall) => (
                    <option key={stall.id} value={stall.id}>
                      {stall.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Name: *</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="e.g., Chicken Rice"
                />
              </div>

              <div className="form-group">
                <label>Category:</label>
                <input
                  type="text"
                  value={newItem.category || ''}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  placeholder="e.g., Main Course, Drinks"
                />
              </div>

              <div className="form-group">
                <label>Price: *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Preparation Time (minutes):</label>
                <input
                  type="number"
                  value={newItem.preparation_time}
                  onChange={(e) => setNewItem({ ...newItem, preparation_time: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group full-width">
                <label>Description:</label>
                <textarea
                  value={newItem.description || ''}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Brief description of the item"
                />
              </div>

              <div className="form-group full-width">
                <label>Image URL:</label>
                <input
                  type="text"
                  value={newItem.image_url || ''}
                  onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newItem.is_available}
                    onChange={(e) => setNewItem({ ...newItem, is_available: e.target.checked })}
                  />
                  Available for orders
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleCreate} className="btn-save">
                💾 Create in Database
              </button>
              <button onClick={() => setCreatingItem(false)} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Menu Item (Database Update)</h2>
            <p className="modal-info">💾 Changes will be saved to database and visible to students</p>

            <div className="form-grid">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Category:</label>
                <input
                  type="text"
                  value={editingItem.category || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Price:</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>Preparation Time (minutes):</label>
                <input
                  type="number"
                  value={editingItem.preparation_time}
                  onChange={(e) => setEditingItem({ ...editingItem, preparation_time: parseInt(e.target.value) })}
                />
              </div>

              <div className="form-group full-width">
                <label>Description:</label>
                <textarea
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                />
              </div>

              <div className="form-group full-width">
                <label>Image URL:</label>
                <input
                  type="text"
                  value={editingItem.image_url || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editingItem.is_available}
                    onChange={(e) => setEditingItem({ ...editingItem, is_available: e.target.checked })}
                  />
                  Available for orders
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleSave} className="btn-save">
                💾 Save to Database
              </button>
              <button onClick={() => setEditingItem(null)} className="btn-cancel">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;