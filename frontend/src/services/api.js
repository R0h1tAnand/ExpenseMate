import axios from 'axios';
import { API_ENDPOINTS, TOKEN_KEY, REFRESH_TOKEN_KEY, REQUEST_TIMEOUT } from '../config/constants';

// Create axios instance
const api = axios.create({
  timeout: REQUEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      data: config.data
    });
    
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  async (error) => {
    console.error('API Response Error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data
    });
    
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          const response = await axios.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          localStorage.setItem(TOKEN_KEY, accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Authentication
  auth: {
    signup: (data) => api.post(API_ENDPOINTS.AUTH.SIGNUP, data),
    login: (data) => api.post(API_ENDPOINTS.AUTH.LOGIN, data),
    getProfile: () => api.get(API_ENDPOINTS.AUTH.PROFILE),
    updateProfile: (data) => api.put(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data),
    changePassword: (data) => api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),
    refreshToken: (data) => api.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN, data),
  },

  // Users
  users: {
    getAll: (params) => api.get(API_ENDPOINTS.USERS.BASE, { params }),
    getById: (id) => api.get(API_ENDPOINTS.USERS.BY_ID(id)),
    create: (data) => api.post(API_ENDPOINTS.USERS.BASE, data),
    update: (id, data) => api.put(API_ENDPOINTS.USERS.BY_ID(id), data),
    delete: (id) => api.delete(API_ENDPOINTS.USERS.BY_ID(id)),
    assignManager: (id, data) => api.patch(API_ENDPOINTS.USERS.ASSIGN_MANAGER(id), data),
    changeRole: (id, data) => api.patch(API_ENDPOINTS.USERS.CHANGE_ROLE(id), data),
    getSubordinates: () => api.get(API_ENDPOINTS.USERS.SUBORDINATES),
  },

  // Companies
  companies: {
    getAll: () => api.get(API_ENDPOINTS.COMPANIES.BASE),
    getById: (id) => api.get(API_ENDPOINTS.COMPANIES.BY_ID(id)),
    create: (data) => api.post(API_ENDPOINTS.COMPANIES.BASE, data),
    update: (id, data) => api.put(API_ENDPOINTS.COMPANIES.BY_ID(id), data),
    delete: (id) => api.delete(API_ENDPOINTS.COMPANIES.BY_ID(id)),
    getCurrencies: () => api.get(API_ENDPOINTS.COMPANIES.CURRENCIES),
  },

  // Expenses
  expenses: {
    getAll: (params) => api.get(API_ENDPOINTS.EXPENSES.BASE, { params }),
    getById: (id) => api.get(API_ENDPOINTS.EXPENSES.BY_ID(id)),
    create: (data) => api.post(API_ENDPOINTS.EXPENSES.BASE, data),
    update: (id, data) => api.put(API_ENDPOINTS.EXPENSES.BY_ID(id), data),
    submit: (id, data) => api.post(API_ENDPOINTS.EXPENSES.SUBMIT(id), data),
    approve: (id, data) => api.post(API_ENDPOINTS.EXPENSES.APPROVE(id), data),
    reject: (id, data) => api.post(API_ENDPOINTS.EXPENSES.REJECT(id), data),
    getPending: (params) => api.get(API_ENDPOINTS.EXPENSES.PENDING, { params }),
    getPendingApprovals: (params) => api.get(API_ENDPOINTS.EXPENSES.PENDING, { params }),
    updateStatus: (id, data) => {
      // Legacy support - map to approve/reject
      if (data.status === 'APPROVED') {
        return api.post(API_ENDPOINTS.EXPENSES.APPROVE(id), data);
      } else if (data.status === 'REJECTED') {
        return api.post(API_ENDPOINTS.EXPENSES.REJECT(id), data);
      }
      return api.put(API_ENDPOINTS.EXPENSES.BY_ID(id), data);
    },
  },

  // Workflows
  workflows: {
    getAll: (params) => api.get(API_ENDPOINTS.WORKFLOWS.BASE, { params }),
    getById: (id) => api.get(API_ENDPOINTS.WORKFLOWS.BY_ID(id)),
    create: (data) => api.post(API_ENDPOINTS.WORKFLOWS.BASE, data),
    update: (id, data) => api.put(API_ENDPOINTS.WORKFLOWS.BY_ID(id), data),
    delete: (id) => api.delete(API_ENDPOINTS.WORKFLOWS.BY_ID(id)),
    getTemplates: () => api.get(API_ENDPOINTS.WORKFLOWS.TEMPLATES),
  },
};

export default api;