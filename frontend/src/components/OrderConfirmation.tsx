import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import './OrderConfirmation.css';

interface OrderData {
  id: number;
  queue_number: number;
  status: string;
  payment_status: string;
  total_amount: number;
  pickup_window_start: string;
  pickup_window_end: string;
  order_items: Array<{
    menu_item: {
      name: string;
    };
    quantity: number;
    unit_price: number;
  }>;
}

interface LocationState {
  order: OrderData;
  stallName: string;
}

const OrderConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const [qrGenerated, setQrGenerated] = useState(false);

  const state = location.state as LocationState | null;

  useEffect(() => {
    // Redirect if no order data
    if (!state || !state.order) {
      navigate('/stalls');
      return;
    }

    // Generate PayNow QR code
    generatePayNowQR();
  }, [state, navigate]);

  const generatePayNowQR = async () => {
    if (!qrCanvasRef.current || !state?.order) return;

    try {
      // PayNow QR code format:
      // For demo purposes, we'll use a simple format with order ID and amount
      // In production, this would follow Singapore's PayNow QR standard
      const paymentData = `PAYNOW|ORDER-${state.order.id}|SGD|${state.order.total_amount.toFixed(2)}`;

      await QRCode.toCanvas(qrCanvasRef.current, paymentData, {
        width: 250,
        margin: 2,
        color: {
          dark: '#1e293b',
          light: '#ffffff'
        }
      });

      setQrGenerated(true);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const formatPickupTime = (startTime: string, endTime: string): string => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  const getEstimatedWaitTime = (): string => {
    if (!state?.order) return 'N/A';

    const queueNumber = state.order.queue_number;
    // Estimate 5-7 minutes per order in queue
    const avgTimePerOrder = 6;
    const waitMinutes = (queueNumber - 1) * avgTimePerOrder;

    if (waitMinutes < 5) {
      return 'Less than 5 mins';
    } else if (waitMinutes < 60) {
      return `${waitMinutes} mins`;
    } else {
      const hours = Math.floor(waitMinutes / 60);
      const mins = waitMinutes % 60;
      return `${hours}h ${mins}m`;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status.toUpperCase()) {
      case 'PENDING_PAYMENT':
        return 'status-pending';
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'PREPARING':
        return 'status-preparing';
      case 'READY':
        return 'status-ready';
      case 'COMPLETED':
        return 'status-completed';
      default:
        return '';
    }
  };

  const formatStatus = (status: string): string => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (!state || !state.order) {
    return null; // Will redirect in useEffect
  }

  const { order, stallName } = state;

  return (
    <div className="order-confirmation-container">
      <div className="confirmation-content">
        {/* Success Header */}
        <div className="success-header">
          <div className="success-icon">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p>Your order has been received and is being processed</p>
        </div>

        {/* Order Details Card */}
        <div className="confirmation-card">
          <div className="card-header">
            <h2>Order Details</h2>
          </div>

          <div className="order-info-grid">
            <div className="info-item">
              <span className="info-label">Order Number</span>
              <span className="info-value">#{order.id.toString().padStart(6, '0')}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Queue Number</span>
              <span className="info-value queue-number">{order.queue_number}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Estimated Wait</span>
              <span className="info-value">{getEstimatedWaitTime()}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Status</span>
              <span className={`status-badge ${getStatusColor(order.status)}`}>
                {formatStatus(order.status)}
              </span>
            </div>
          </div>

          <div className="divider"></div>

          <div className="stall-pickup-info">
            <div className="info-section">
              <h3>📍 Pickup Location</h3>
              <p className="stall-name">{stallName}</p>
            </div>

            <div className="info-section">
              <h3>⏰ Pickup Time</h3>
              <p className="pickup-time">
                {formatPickupTime(order.pickup_window_start, order.pickup_window_end)}
              </p>
            </div>
          </div>

          <div className="divider"></div>

          {/* Order Items */}
          <div className="order-items-section">
            <h3>Order Summary</h3>
            <div className="order-items-list">
              {order.order_items.map((item, index) => (
                <div key={index} className="order-item-row">
                  <span className="item-name">
                    {item.menu_item.name} × {item.quantity}
                  </span>
                  <span className="item-price">
                    ${(item.unit_price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-total-row">
              <span className="total-label">Total Amount</span>
              <span className="total-amount">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* PayNow QR Code Card */}
        {order.payment_status === 'PENDING' && (
          <div className="confirmation-card payment-card">
            <div className="card-header">
              <h2>Complete Payment</h2>
              <span className="payment-status-badge pending">Payment Pending</span>
            </div>

            <div className="payment-content">
              <p className="payment-instruction">
                Scan the QR code below to complete payment via PayNow
              </p>

              <div className="qr-code-container">
                <canvas ref={qrCanvasRef} className="qr-code-canvas"></canvas>
                {!qrGenerated && (
                  <div className="qr-loading">Generating QR code...</div>
                )}
              </div>

              <div className="payment-details">
                <div className="payment-detail-row">
                  <span>Order ID:</span>
                  <span className="detail-value">ORDER-{order.id}</span>
                </div>
                <div className="payment-detail-row">
                  <span>Amount:</span>
                  <span className="detail-value">SGD ${order.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="payment-note">
                💡 Once payment is confirmed, your order will be sent to the stall for preparation
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn-primary"
            onClick={() => navigate('/orders')}
          >
            View My Orders
          </button>

          <button
            className="btn-secondary"
            onClick={() => navigate('/stalls')}
          >
            Back to Stalls
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
