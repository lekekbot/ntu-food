import axios from 'axios';

const API_URL = 'https://ntu-food-production.up.railway.app/api';

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const adminAuthApi = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      ntu_email: email,
      password: password
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await adminApi.get('/auth/me');
    return response.data;
  },

  seedAdmin: async () => {
    const response = await axios.post(`${API_URL}/admin/seed-admin`);
    return response.data;
  }
};

export const adminUsersApi = {
  getAll: async (filters?: { role?: string; is_active?: boolean }) => {
    const response = await adminApi.get('/admin/users', { params: filters });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await adminApi.get(`/admin/users/${id}`);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await adminApi.put(`/admin/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await adminApi.delete(`/admin/users/${id}`);
    return response.data;
  }
};

export const adminStallsApi = {
  getAll: async () => {
    const response = await adminApi.get('/admin/stalls');
    return response.data;
  },

  create: async (data: any) => {
    const response = await adminApi.post('/admin/stalls', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await adminApi.put(`/admin/stalls/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await adminApi.delete(`/admin/stalls/${id}`);
    return response.data;
  }
};

export const adminMenuApi = {
  getAll: async (stallId?: number) => {
    const response = await adminApi.get('/admin/menu-items', {
      params: stallId ? { stall_id: stallId } : {}
    });
    return response.data;
  },

  create: async (data: any) => {
    const response = await adminApi.post('/admin/menu-items', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await adminApi.put(`/admin/menu-items/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await adminApi.delete(`/admin/menu-items/${id}`);
    return response.data;
  }
};

export const adminOrdersApi = {
  getAll: async (filters?: any) => {
    const response = await adminApi.get('/admin/orders', { params: filters });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await adminApi.get(`/admin/orders/${id}`);
    return response.data;
  },

  updateStatus: async (id: number, status: string) => {
    const response = await adminApi.put(`/admin/orders/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: number) => {
    const response = await adminApi.delete(`/admin/orders/${id}`);
    return response.data;
  }
};

export const adminAnalyticsApi = {
  getDashboard: async () => {
    const response = await adminApi.get('/admin/analytics/dashboard');
    return response.data;
  },

  getPopularItems: async (limit: number = 10) => {
    const response = await adminApi.get('/admin/analytics/popular-items', {
      params: { limit }
    });
    return response.data;
  },

  getStallPerformance: async () => {
    const response = await adminApi.get('/admin/analytics/stall-performance');
    return response.data;
  },

  getRecentActivity: async (limit: number = 20) => {
    const response = await adminApi.get('/admin/analytics/recent-activity', {
      params: { limit }
    });
    return response.data;
  }
};

export default adminApi;