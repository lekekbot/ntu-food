import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { stallsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import locationService from '../services/locationService';
import type { UserLocation } from '../services/locationService';
import './StallList.css';

interface Stall {
  id: number;
  name: string;
  location: string;
  description?: string;
  cuisine_type?: string;
  is_open: boolean;
  rating?: number;
  opening_time?: string;
  closing_time?: string;
  image_url?: string;
  latitude?: number;
  longitude?: number;
  building_name?: string;
  distance_km?: number;
  walking_time_minutes?: number;
}

const StallList = () => {
  console.log('[StallList] Component rendering');

  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [sortByDistance, setSortByDistance] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null); // Distance in km, null = no filter
  const [allStalls, setAllStalls] = useState<Stall[]>([]); // Store all fetched stalls
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    console.log('[StallList] Component mounted, user:', user);

    // Fetch stalls immediately on mount (without waiting for location)
    try {
      fetchStalls(null);
    } catch (err) {
      console.error('[StallList] Error in fetchStalls:', err);
    }

    // Try to get location in background (non-blocking)
    try {
      requestLocation();
    } catch (err) {
      console.error('[StallList] Error in requestLocation:', err);
    }
  }, []);

  const requestLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
      setLocationPermission('granted');
      setShowLocationPrompt(false);
      setSortByDistance(true);
      // Re-fetch stalls with location for distance sorting
      fetchStalls(location);
    } catch (error: any) {
      console.log('Location permission denied or error:', error);
      setLocationPermission('denied');
      setLocationError(error.message || 'Location access denied');
      setShowLocationPrompt(false);
      // Already fetched stalls without location in useEffect
    }
  };

  const fetchStalls = async (location: UserLocation | null) => {
    console.log('[StallList] Fetching stalls', { location, sortByDistance });
    setLoading(true);
    try {
      let response;
      if (location && sortByDistance) {
        // Fetch nearby stalls sorted by distance
        console.log('[StallList] Fetching nearby stalls');
        response = await stallsAPI.getNearby(location.latitude, location.longitude);
      } else {
        // Fetch all stalls without distance sorting
        console.log('[StallList] Fetching all stalls');
        response = await stallsAPI.getAll();
      }
      console.log('[StallList] Stalls fetched successfully:', response.data.length);
      setAllStalls(response.data); // Store all stalls
      applyDistanceFilter(response.data, distanceFilter); // Apply current filter
      setError('');
    } catch (error) {
      console.error('[StallList] Failed to fetch stalls:', error);
      setError('Failed to load stalls. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyDistanceFilter = (stallList: Stall[], maxDistance: number | null) => {
    if (maxDistance === null || !sortByDistance) {
      // No filter, show all stalls
      setStalls(stallList);
    } else {
      // Filter stalls within the distance
      const filtered = stallList.filter(stall =>
        stall.distance_km !== undefined &&
        stall.distance_km !== null &&
        stall.distance_km <= maxDistance
      );
      setStalls(filtered);
    }
  };

  const handleDistanceFilterChange = (maxDistance: number | null) => {
    setDistanceFilter(maxDistance);
    applyDistanceFilter(allStalls, maxDistance);
  };

  const handleRefreshLocation = () => {
    setLocationError('');
    requestLocation();
  };

  const handleSortByNearest = () => {
    if (userLocation) {
      setSortByDistance(true);
      setDistanceFilter(null); // Reset distance filter when switching to nearest mode
      fetchStalls(userLocation);
    }
  };

  const handleShowAll = () => {
    setSortByDistance(false);
    setDistanceFilter(null); // Reset distance filter when showing all
    fetchStalls(null);
  };

  const handleStallClick = (stallId: number) => {
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

          {/* Location Permission Banner */}
          {showLocationPrompt && locationPermission === 'prompt' && (
            <div className="location-prompt">
              <div className="location-prompt-icon">📍</div>
              <div className="location-prompt-content">
                <h3>Enable Location for Nearby Stalls</h3>
                <p>See food stalls near you with distance and walking time</p>
                <p className="location-privacy">
                  🔒 Your location is only used for calculations and never stored
                </p>
              </div>
              <div className="location-prompt-actions">
                <button onClick={requestLocation} className="enable-location-button">
                  Enable Location
                </button>
                <button onClick={() => {setShowLocationPrompt(false); fetchStalls(null);}} className="skip-location-button">
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Location Status Banner */}
          {locationPermission === 'granted' && userLocation && (
            <div className="location-status success">
              <span>🧭 Showing stalls near you</span>
              <button onClick={handleRefreshLocation} className="refresh-location-button">
                🔄 Refresh Location
              </button>
            </div>
          )}

          {locationPermission === 'denied' && locationError && (
            <div className="location-status error">
              <span>⚠️ {locationError}</span>
              <button onClick={handleRefreshLocation} className="retry-location-button">
                Try Again
              </button>
            </div>
          )}

          {/* Sort Controls */}
          {allStalls.length > 0 && (
            <>
              <div className="stall-controls">
                <div className="sort-controls">
                  <button
                    onClick={handleShowAll}
                    className={`sort-button ${!sortByDistance ? 'active' : ''}`}
                  >
                    📋 All Stalls
                  </button>
                  <button
                    onClick={handleSortByNearest}
                    className={`sort-button ${sortByDistance && userLocation ? 'active' : ''}`}
                    disabled={!userLocation}
                    title={!userLocation ? 'Enable location to use this filter' : 'Show nearest stalls first'}
                  >
                    📍 Nearest First
                  </button>
                </div>
                <p className="stall-count">
                  {sortByDistance && userLocation
                    ? distanceFilter
                      ? `Showing ${stalls.length} of ${allStalls.length} stalls within ${distanceFilter} km`
                      : `Showing ${stalls.length} stalls sorted by distance`
                    : `Showing all ${stalls.length} stalls`
                  }
                </p>
              </div>

              {/* Distance Filter (only show when sorted by nearest) */}
              {sortByDistance && userLocation && (
                <div className="distance-filter-container">
                  <label className="filter-label">📏 Filter by distance:</label>
                  <div className="distance-filter-buttons">
                    <button
                      onClick={() => handleDistanceFilterChange(null)}
                      className={`distance-filter-button ${distanceFilter === null ? 'active' : ''}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => handleDistanceFilterChange(0.5)}
                      className={`distance-filter-button ${distanceFilter === 0.5 ? 'active' : ''}`}
                    >
                      ≤ 500m
                    </button>
                    <button
                      onClick={() => handleDistanceFilterChange(1)}
                      className={`distance-filter-button ${distanceFilter === 1 ? 'active' : ''}`}
                    >
                      ≤ 1 km
                    </button>
                    <button
                      onClick={() => handleDistanceFilterChange(2)}
                      className={`distance-filter-button ${distanceFilter === 2 ? 'active' : ''}`}
                    >
                      ≤ 2 km
                    </button>
                    <button
                      onClick={() => handleDistanceFilterChange(5)}
                      className={`distance-filter-button ${distanceFilter === 5 ? 'active' : ''}`}
                    >
                      ≤ 5 km
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="error-message">
              {error}
              <button onClick={() => fetchStalls(userLocation)} className="retry-button">
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

                  {/* Distance Information */}
                  {stall.distance_km !== undefined && stall.distance_km !== null && (
                    <div className="stall-distance">
                      <span className="distance-badge">
                        {stall.distance_km.toFixed(1)} km away
                      </span>
                      {stall.walking_time_minutes && (
                        <span className="walking-time">
                          • ~{stall.walking_time_minutes} min walk
                        </span>
                      )}
                    </div>
                  )}

                  <p className="stall-cuisine">{stall.cuisine_type || 'Various'}</p>

                  {stall.description && (
                    <p className="stall-description">{stall.description}</p>
                  )}

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
              <button onClick={() => fetchStalls(userLocation)} className="refresh-button">
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