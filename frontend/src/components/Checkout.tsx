import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../services/api';
import notify from '../utils/notifications';
import './Checkout.css';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, stallId, stallName, clearCart } = useCart();

  const [pickupTimeSlots, setPickupTimeSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod] = useState('PAYNOW'); // Default payment method
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if cart is empty
    if (cart.length === 0) {
      navigate('/stalls');
      return;
    }

    // Generate pickup time slots
    generateTimeSlots();
  }, [cart, navigate]);

  const generateTimeSlots = () => {
    const slots: string[] = [];
    const now = new Date();

    // Start from 30 minutes from now (rounded to next 15 min interval)
    const startTime = new Date(now.getTime() + 30 * 60 * 1000);
    startTime.setMinutes(Math.ceil(startTime.getMinutes() / 15) * 15);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);

    // Generate slots up to 3 hours from now
    const endTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    let currentSlot = new Date(startTime);
    while (currentSlot <= endTime) {
      const slotEnd = new Date(currentSlot.getTime() + 15 * 60 * 1000);

      const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      };

      const slotString = `${formatTime(currentSlot)} - ${formatTime(slotEnd)}`;
      slots.push(slotString);

      currentSlot = new Date(currentSlot.getTime() + 15 * 60 * 1000);
    }

    setPickupTimeSlots(slots);
    if (slots.length > 0) {
      setSelectedSlot(slots[0]); // Default to first slot
    }
  };

  const parseTimeSlot = (slot: string): { start: Date; end: Date } => {
    // Parse "HH:MM AM/PM - HH:MM AM/PM" format
    const [startStr, endStr] = slot.split(' - ');

    const now = new Date();
    const parseTime = (timeStr: string): Date => {
      const [time, period] = timeStr.trim().split(' ');
      const [hours, minutes] = time.split(':').map(Number);

      let hour24 = hours;
      if (period === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period === 'AM' && hours === 12) {
        hour24 = 0;
      }

      const date = new Date(now);
      date.setHours(hour24, minutes, 0, 0);

      // If the time is earlier than current time, it must be tomorrow
      if (date < now) {
        date.setDate(date.getDate() + 1);
      }

      return date;
    };

    return {
      start: parseTime(startStr),
      end: parseTime(endStr)
    };
  };

  const handlePlaceOrder = async () => {
    if (!selectedSlot) {
      notify.warning('Please select a pickup time slot');
      return;
    }

    if (!stallId) {
      notify.error('Invalid stall selection');
      return;
    }

    setLoading(true);
    setError('');
    const loadingToast = notify.loading('Placing your order...');

    try {
      const { start, end } = parseTimeSlot(selectedSlot);

      const orderData = {
        stall_id: stallId,
        items: cart.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          special_requests: item.special_requests || null
        })),
        pickup_window_start: start.toISOString(),
        pickup_window_end: end.toISOString(),
        payment_method: paymentMethod,
        special_instructions: specialInstructions || null
      };

      const response = await ordersAPI.create(orderData);

      // Clear cart on successful order
      clearCart();

      // Dismiss loading and show success
      notify.dismiss(loadingToast);
      notify.success('Order placed successfully!');

      // Navigate to order confirmation with order details
      navigate('/order-confirmation', {
        state: {
          order: response.data,
          stallName: stallName
        }
      });
    } catch (err: any) {
      console.error('Failed to place order:', err);
      notify.dismiss(loadingToast);
      const errorMsg = err.response?.data?.detail || 'Failed to place order. Please try again.';
      setError(errorMsg);
      notify.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="checkout-container">
      <header className="checkout-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back
        </button>
        <h1>Checkout</h1>
      </header>

      <div className="checkout-content">
        {/* Order Summary */}
        <section className="checkout-section">
          <h2>Order Summary</h2>
          <div className="stall-info-box">
            <span className="stall-label">Ordering from:</span>
            <span className="stall-name-text">{stallName}</span>
          </div>

          <div className="order-items">
            {cart.map((item) => (
              <div key={item.menu_item_id} className="checkout-item">
                <div className="item-info-row">
                  <span className="item-name-qty">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="item-price-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
                {item.special_requests && (
                  <div className="item-special-requests">
                    Note: {item.special_requests}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="order-total">
            <span className="total-label">Total</span>
            <span className="total-amount">${cartTotal.toFixed(2)}</span>
          </div>
        </section>

        {/* Pickup Time Selection */}
        <section className="checkout-section">
          <h2>Pickup Time</h2>
          <p className="section-description">
            Select your preferred 15-minute pickup window
          </p>

          <div className="time-slots-grid">
            {pickupTimeSlots.map((slot) => (
              <button
                key={slot}
                className={`time-slot-button ${selectedSlot === slot ? 'selected' : ''}`}
                onClick={() => setSelectedSlot(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </section>

        {/* Special Instructions */}
        <section className="checkout-section">
          <h2>Special Instructions</h2>
          <p className="section-description">
            Any additional notes for the stall owner (optional)
          </p>

          <textarea
            className="special-instructions-textarea"
            placeholder="E.g., Extra utensils, no ice, allergies..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            maxLength={500}
            rows={4}
          />
          <div className="char-count">
            {specialInstructions.length}/500
          </div>
        </section>

        {/* Payment Method */}
        <section className="checkout-section">
          <h2>Payment Method</h2>
          <div className="payment-method-box">
            <div className="payment-icon">💳</div>
            <div className="payment-info">
              <div className="payment-method-name">PayNow</div>
              <div className="payment-method-description">
                Pay via QR code after order confirmation
              </div>
            </div>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Place Order Button */}
        <button
          className="place-order-btn"
          onClick={handlePlaceOrder}
          disabled={loading || !selectedSlot}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Placing Order...
            </>
          ) : (
            <>
              Place Order - ${cartTotal.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Checkout;
