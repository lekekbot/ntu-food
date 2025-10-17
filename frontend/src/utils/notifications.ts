import toast from 'react-hot-toast';

// Sound notification utility
class SoundNotification {
  private context: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.context = new AudioContext();
    }
  }

  // Play a simple beep sound
  private playTone(frequency: number, duration: number, volume: number = 0.3) {
    if (!this.context) return;

    const oscillator = this.context.createOscillator();
    const gainNode = this.context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.context.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, this.context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);

    oscillator.start(this.context.currentTime);
    oscillator.stop(this.context.currentTime + duration);
  }

  // Success sound (ascending tones)
  success() {
    this.playTone(523.25, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 0.15), 100); // E5
  }

  // Error sound (descending tones)
  error() {
    this.playTone(392, 0.15); // G4
    setTimeout(() => this.playTone(293.66, 0.2), 150); // D4
  }

  // Alert sound (repeating tone)
  alert() {
    this.playTone(880, 0.1); // A5
    setTimeout(() => this.playTone(880, 0.1), 200);
  }

  // New order sound (attention grabbing)
  newOrder() {
    this.playTone(659.25, 0.15); // E5
    setTimeout(() => this.playTone(783.99, 0.15), 150); // G5
    setTimeout(() => this.playTone(1046.5, 0.2), 300); // C6
  }
}

const soundNotifier = new SoundNotification();

// Toast notification helpers
export const notify = {
  // Success notifications
  success: (message: string, playSound: boolean = true) => {
    if (playSound) soundNotifier.success();
    toast.success(message, {
      duration: 4000,
      style: {
        background: '#10b981',
        color: '#fff',
        fontWeight: '600',
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10b981',
      },
    });
  },

  // Error notifications
  error: (message: string, playSound: boolean = true) => {
    if (playSound) soundNotifier.error();
    toast.error(message, {
      duration: 5000,
      style: {
        background: '#ef4444',
        color: '#fff',
        fontWeight: '600',
        padding: '16px',
        borderRadius: '8px',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#ef4444',
      },
    });
  },

  // Info notifications
  info: (message: string) => {
    toast(message, {
      duration: 4000,
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#fff',
        fontWeight: '600',
        padding: '16px',
        borderRadius: '8px',
      },
    });
  },

  // Warning notifications
  warning: (message: string) => {
    toast(message, {
      duration: 4000,
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: '#fff',
        fontWeight: '600',
        padding: '16px',
        borderRadius: '8px',
      },
    });
  },

  // Loading notifications
  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: '#6366f1',
        color: '#fff',
        fontWeight: '600',
        padding: '16px',
        borderRadius: '8px',
      },
    });
  },

  // Dismiss loading
  dismiss: (toastId: string) => {
    toast.dismiss(toastId);
  },

  // New order alert (for stall owners)
  newOrder: (orderNumber: number, playSound: boolean = true) => {
    if (playSound) soundNotifier.newOrder();
    toast.success(`🔔 New Order #${orderNumber}!`, {
      duration: 6000,
      style: {
        background: 'linear-gradient(135deg, #10b981, #059669)',
        color: '#fff',
        fontWeight: '700',
        padding: '16px 20px',
        borderRadius: '12px',
        fontSize: '1.1rem',
      },
    });
  },

  // Order ready alert (for customers)
  orderReady: (queueNumber: number, playSound: boolean = true) => {
    if (playSound) soundNotifier.alert();
    toast.success(`🔔 Order #${queueNumber} is Ready!`, {
      duration: 8000,
      style: {
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        color: '#fff',
        fontWeight: '700',
        padding: '16px 20px',
        borderRadius: '12px',
        fontSize: '1.1rem',
      },
    });
  },

  // Payment reminder
  paymentReminder: () => {
    toast('💳 Please complete payment to proceed', {
      duration: 5000,
      icon: '⚠️',
      style: {
        background: '#fbbf24',
        color: '#78350f',
        fontWeight: '700',
        padding: '16px',
        borderRadius: '8px',
      },
    });
  },

  // Custom toast
  custom: (message: string, emoji: string, color: string) => {
    toast(message, {
      duration: 4000,
      icon: emoji,
      style: {
        background: color,
        color: '#fff',
        fontWeight: '600',
        padding: '16px',
        borderRadius: '8px',
      },
    });
  },
};

// Promise-based notifications (useful for async operations)
export const notifyPromise = {
  async: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    playSound: boolean = true
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: (data) => {
          if (playSound) soundNotifier.success();
          return messages.success;
        },
        error: (err) => {
          if (playSound) soundNotifier.error();
          return messages.error;
        },
      },
      {
        style: {
          fontWeight: '600',
          padding: '16px',
          borderRadius: '8px',
        },
        success: {
          style: {
            background: '#10b981',
            color: '#fff',
          },
        },
        error: {
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        },
        loading: {
          style: {
            background: '#6366f1',
            color: '#fff',
          },
        },
      }
    );
  },
};

export default notify;
