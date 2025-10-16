import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    cartCount,
    cartTotal,
    stallName,
    isCartOpen,
    closeCart,
    openCart,
    updateQuantity,
    updateSpecialRequests,
    removeFromCart,
    clearCart
  } = useCart();

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }
    closeCart();
    navigate('/checkout');
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  return (
    <>
      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <button className="floating-cart-button" onClick={openCart}>
          🛒
          <span className="cart-badge">{cartCount}</span>
        </button>
      )}

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div className="cart-overlay" onClick={closeCart}>
          {/* Cart Drawer */}
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Your Cart</h2>
              <button className="close-button" onClick={closeCart}>
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <p>Your cart is empty</p>
                <button onClick={closeCart} className="continue-shopping-button">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Stall Name */}
                <div className="cart-stall-info">
                  <span className="stall-label">Ordering from:</span>
                  <span className="stall-name">{stallName}</span>
                </div>

                {/* Cart Items */}
                <div className="cart-items-container">
                  {cart.map((item) => (
                    <div key={item.menu_item_id} className="cart-drawer-item">
                      <div className="item-header">
                        <h4>{item.name}</h4>
                        <button
                          className="remove-item-button"
                          onClick={() => removeFromCart(item.menu_item_id)}
                          title="Remove item"
                        >
                          🗑️
                        </button>
                      </div>

                      <div className="item-details">
                        <span className="item-price">${item.price.toFixed(2)} each</span>

                        <div className="quantity-controls">
                          <button
                            className="qty-button"
                            onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            -
                          </button>
                          <span className="quantity-display">{item.quantity}</span>
                          <button
                            className="qty-button"
                            onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                          >
                            +
                          </button>
                        </div>

                        <span className="item-subtotal">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Special Requests */}
                      <div className="special-requests-section">
                        <input
                          type="text"
                          className="special-requests-input"
                          placeholder="Special requests (optional)"
                          value={item.special_requests || ''}
                          onChange={(e) =>
                            updateSpecialRequests(item.menu_item_id, e.target.value)
                          }
                          maxLength={200}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Footer */}
                <div className="cart-footer">
                  <div className="cart-total-section">
                    <div className="total-row">
                      <span className="total-label">Subtotal ({cartCount} items)</span>
                      <span className="total-amount">${cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button className="checkout-button" onClick={handleCheckout}>
                    Proceed to Checkout
                  </button>

                  <button className="clear-cart-button" onClick={handleClearCart}>
                    Clear Cart
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CartDrawer;
