import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

// Cart item interface
export interface CartItem {
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  special_requests?: string;
  stall_id: number;
  stall_name: string;
}

// Cart context interface
interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  stallId: number | null;
  stallName: string | null;
  addToCart: (item: CartItem) => void;
  removeFromCart: (menu_item_id: number) => void;
  updateQuantity: (menu_item_id: number, quantity: number) => void;
  updateSpecialRequests: (menu_item_id: number, special_requests: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// localStorage key
const CART_STORAGE_KEY = 'ntu_food_cart';
const CART_STALL_KEY = 'ntu_food_cart_stall';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [stallId, setStallId] = useState<number | null>(null);
  const [stallName, setStallName] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      const savedStall = localStorage.getItem(CART_STALL_KEY);

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }

      if (savedStall) {
        const stall = JSON.parse(savedStall);
        setStallId(stall.id);
        setStallName(stall.name);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(CART_STALL_KEY);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      if (cart.length > 0) {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        if (stallId && stallName) {
          localStorage.setItem(CART_STALL_KEY, JSON.stringify({ id: stallId, name: stallName }));
        }
      } else {
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(CART_STALL_KEY);
        setStallId(null);
        setStallName(null);
      }
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart, stallId, stallName]);

  // Calculate cart totals
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addToCart = (item: CartItem) => {
    // Check if cart is from different stall
    if (stallId !== null && stallId !== item.stall_id) {
      const confirmSwitch = window.confirm(
        `Your cart contains items from ${stallName}. Adding items from ${item.stall_name} will clear your current cart. Continue?`
      );

      if (!confirmSwitch) {
        return;
      }

      // Clear cart and start fresh with new stall
      setCart([item]);
      setStallId(item.stall_id);
      setStallName(item.stall_name);
      return;
    }

    // Set stall if this is first item
    if (stallId === null) {
      setStallId(item.stall_id);
      setStallName(item.stall_name);
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.menu_item_id === item.menu_item_id
    );

    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += item.quantity;
      updatedCart[existingItemIndex].special_requests = item.special_requests || updatedCart[existingItemIndex].special_requests;
      setCart(updatedCart);
    } else {
      // Add new item to cart
      setCart([...cart, item]);
    }

    // Auto-open cart when item is added
    setIsCartOpen(true);
  };

  const removeFromCart = (menu_item_id: number) => {
    const updatedCart = cart.filter((item) => item.menu_item_id !== menu_item_id);
    setCart(updatedCart);
  };

  const updateQuantity = (menu_item_id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menu_item_id);
      return;
    }

    const updatedCart = cart.map((item) =>
      item.menu_item_id === menu_item_id
        ? { ...item, quantity: Math.min(quantity, 10) } // Max 10 per item
        : item
    );
    setCart(updatedCart);
  };

  const updateSpecialRequests = (menu_item_id: number, special_requests: string) => {
    const updatedCart = cart.map((item) =>
      item.menu_item_id === menu_item_id
        ? { ...item, special_requests }
        : item
    );
    setCart(updatedCart);
  };

  const clearCart = () => {
    setCart([]);
    setStallId(null);
    setStallName(null);
    localStorage.removeItem(CART_STORAGE_KEY);
    localStorage.removeItem(CART_STALL_KEY);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const value: CartContextType = {
    cart,
    cartCount,
    cartTotal,
    stallId,
    stallName,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateSpecialRequests,
    clearCart,
    isCartOpen,
    openCart,
    closeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
