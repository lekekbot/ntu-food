import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stallsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './StallList.css';

const StallList = () => {
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchStalls();
  }, []);

  const fetchStalls = async () => {
    try {
      const response = await stallsAPI.getAll();
      setStalls(response.data);
    } catch (error) {
      console.error('Failed to fetch stalls:', error);
      setError('Failed to load stalls. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStallClick = (stallId) => {
    navigate(`/stalls/${stallId}/menu`);
  };

  const handleViewOrders = () => {
    navigate('/orders');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading stalls...</p>
      </div>
    );
  }

  return (
    <div className="stall-list-container">
      <header className="stall-header">
        <div className="header-content">
          <h1>NTU Food</h1>
          <div className="user-info">
            <span>Welcome, {user?.name}</span>
            <button onClick={handleViewOrders} className="orders-button">
              My Orders
            </button>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="stall-main">
        <div className="stall-content">
          <h2>Choose a Food Stall</h2>

          {error && (
            <div className="error-message">
              {error}
              <button onClick={fetchStalls} className="retry-button">
                Retry
              </button>
            </div>
          )}

          <div className="stalls-grid">
            {stalls.map((stall) => (
              <div
                key={stall.id}
                className="stall-card"
                onClick={() => handleStallClick(stall.id)}
              >
                <div className="stall-image">
                  {stall.image_url ? (
                    <img src={stall.image_url} alt={stall.name} />
                  ) : (
                    <div className="stall-placeholder">
                      🍽️
                    </div>
                  )}
                </div>

                <div className="stall-info">
                  <h3>{stall.name}</h3>
                  <p className="stall-location">📍 {stall.location}</p>
                  <p className="stall-cuisine">{stall.cuisine_type || 'Various'}</p>

                  <div className="stall-details">
                    <div className="stall-rating">
                      ⭐ {stall.rating?.toFixed(1) || 'New'}
                    </div>
                    <div className={`stall-status ${stall.is_open ? 'open' : 'closed'}`}>
                      {stall.is_open ? '🟢 Open' : '🔴 Closed'}
                    </div>
                  </div>

                  {stall.opening_time && stall.closing_time && (
                    <p className="stall-hours">
                      🕒 {stall.opening_time} - {stall.closing_time}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {stalls.length === 0 && !loading && (
            <div className="no-stalls">
              <p>No stalls available at the moment.</p>
              <button onClick={fetchStalls} className="refresh-button">
                Refresh
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StallList;