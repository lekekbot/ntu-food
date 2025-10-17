import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { menuAPI, stallsAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import './MenuView.css';

const MenuView = () => {
  const { stallId } = useParams();
  const navigate = useNavigate();
  const { cart, cartTotal, addToCart, updateQuantity, updateSpecialRequests } = useCart();

  const [stall, setStall] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStallAndMenu();
  }, [stallId]);

  const fetchStallAndMenu = async () => {
    try {
      setLoading(true);
      const [stallResponse, menuResponse] = await Promise.all([
        stallsAPI.getById(stallId),
        menuAPI.getByStall(stallId)
      ]);

      setStall(stallResponse.data);
      setMenuItems(menuResponse.data.filter(item => item.is_available));
    } catch (error) {
      console.error('Failed to fetch stall/menu:', error);
      setError('Failed to load menu. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (menuItem) => {
    addToCart({
      menu_item_id: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1,
      stall_id: parseInt(stallId),
      stall_name: stall?.name || ''
    });
  };

  const handleRemoveFromCart = (menuItemId) => {
    const existingItem = cart.find(item => item.menu_item_id === menuItemId);

    if (existingItem) {
      if (existingItem.quantity > 1) {
        updateQuantity(menuItemId, existingItem.quantity - 1);
      } else {
        updateQuantity(menuItemId, 0); // This will remove the item
      }
    }
  };

  const handleUpdateSpecialRequests = (menuItemId, requests) => {
    updateSpecialRequests(menuItemId, requests);
  };

  const getCartItemQuantity = (menuItemId) => {
    const item = cart.find(item => item.menu_item_id === menuItemId);
    return item ? item.quantity : 0;
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      alert('Please add items to your cart before placing an order.');
      return;
    }

    navigate('/place-order', {
      state: {
        stall,
        cart,
        totalAmount: cartTotal
      }
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading menu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={fetchStallAndMenu} className="retry-button">
          Retry
        </button>
        <button onClick={() => navigate('/stalls')} className="back-button">
          Back to Stalls
        </button>
      </div>
    );
  }

  return (
    <div className="menu-container">
      <header className="menu-header">
        <button onClick={() => navigate('/stalls')} className="back-button">
          ← Back to Stalls
        </button>

        <div className="stall-info">
          <h1>{stall?.name}</h1>
          <p>📍 {stall?.location}</p>
          <div className={`stall-status ${stall?.is_open ? 'open' : 'closed'}`}>
            {stall?.is_open ? '🟢 Open' : '🔴 Closed'}
          </div>
        </div>
      </header>

      <div className="menu-content">
        <div className="menu-section">
          <h2>Menu Items</h2>

          {menuItems.length === 0 ? (
            <p className="no-items">No menu items available at the moment.</p>
          ) : (
            <div className="menu-grid">
              {menuItems.map((item) => (
                <div key={item.id} className="menu-item">
                  <div className="item-image">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} />
                    ) : (
                      <div className="item-placeholder">🍽️</div>
                    )}
                  </div>

                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p className="item-description">{item.description}</p>
                    <div className="item-details">
                      <span className="item-price">${item.price.toFixed(2)}</span>
                      <div className="item-tags">
                        {item.is_vegetarian && <span className="tag vegetarian">🌱 Veg</span>}
                        {item.is_halal && <span className="tag halal">🥗 Halal</span>}
                      </div>
                    </div>

                    <div className="item-actions">
                      <div className="quantity-controls">
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          disabled={getCartItemQuantity(item.id) === 0}
                          className="quantity-btn minus"
                        >
                          -
                        </button>
                        <span className="quantity">{getCartItemQuantity(item.id)}</span>
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="quantity-btn plus"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {getCartItemQuantity(item.id) > 0 && (
                      <div className="special-requests">
                        <input
                          type="text"
                          placeholder="Special requests (optional)"
                          value={cart.find(cartItem => cartItem.menu_item_id === item.id)?.special_requests || ''}
                          onChange={(e) => handleUpdateSpecialRequests(item.id, e.target.value)}
                          className="requests-input"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.menu_item_id} className="cart-item">
                  <span className="item-name">
                    {item.name} x {item.quantity}
                  </span>
                  <span className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <strong>Total: ${cartTotal.toFixed(2)}</strong>
            </div>
            <button onClick={handlePlaceOrder} className="place-order-button">
              Place Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuView;