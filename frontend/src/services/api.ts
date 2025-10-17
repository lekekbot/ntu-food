import axios from 'axios';

const API_BASE_URL = 'https://ntu-food-production.up.railway.app';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  getProfile: () => api.get('/api/auth/me'),
};

// Stalls API calls
export const stallsAPI = {
  getAll: () => api.get('/api/stalls/'),
  getById: (id) => api.get(`/api/stalls/${id}`),
  getNearby: (lat: number, lng: number) => api.get(`/api/stalls/nearby?lat=${lat}&lng=${lng}`),
};

// Menu API calls
export const menuAPI = {
  getByStall: (stallId) => api.get(`/api/menu/stall/${stallId}`),
};

// Orders API calls
export const ordersAPI = {
  create: (orderData) => api.post('/api/orders/', orderData),
  getAll: () => api.get('/api/orders/'),
  getById: (id) => api.get(`/api/orders/${id}`),
  // Fetch orders for the current stall owner
  getStallOrders: async () => {
    const profile = await authAPI.getProfile();
    const userId = profile.data.id;
    const stalls = await stallsAPI.getAll();
    const dataUnknown: unknown = stalls.data;
    if (!Array.isArray(dataUnknown)) {
      throw new Error('Unexpected stalls response');
    }
    const myStall = (dataUnknown as { owner_id?: number; id: number }[]).find(
      (s) => s.owner_id === userId
    );
    if (!myStall) {
      throw new Error('No stall assigned to current user');
    }
    return api.get(`/api/orders/stall/${myStall.id}/orders`);
  },
  // Confirm payment for an order (backend expects a boolean)
  confirmPayment: (orderId: number) =>
    api.put(`/api/orders/${orderId}/confirm-payment`, { payment_confirmed: true }),
  // Update order status
  updateStatus: (orderId: number, body: { status: string }) =>
    api.put(`/api/orders/${orderId}/status`, body),
  // Complete order convenience helper
  completeOrder: (orderId: number) =>
    api.put(`/api/orders/${orderId}/status`, { status: 'COMPLETED' }),
};

// Queue API calls
export const queueAPI = {
  getStallQueue: (stallId) => api.get(`/api/queue/${stallId}`),
  getPosition: (orderId) => api.get(`/api/queue/position/${orderId}`),
};

export default api;