// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

// Application Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'Expense Management System',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.VITE_NODE_ENV || 'development',
};

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    SIGNUP: `${API_BASE_URL}/auth/signup`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  },

  // Users
  USERS: {
    BASE: `${API_BASE_URL}/users`,
    SUBORDINATES: `${API_BASE_URL}/users/subordinates`,
    BY_ID: (id) => `${API_BASE_URL}/users/${id}`,
    ASSIGN_MANAGER: (id) => `${API_BASE_URL}/users/${id}/manager`,
    CHANGE_ROLE: (id) => `${API_BASE_URL}/users/${id}/role`,
  },

  // Companies
  COMPANIES: {
    BASE: `${API_BASE_URL}/companies`,
    BY_ID: (id) => `${API_BASE_URL}/companies/${id}`,
    CURRENCIES: `${API_BASE_URL}/companies/utils/currencies`,
  },

  // Expenses
  EXPENSES: {
    BASE: `${API_BASE_URL}/expenses`,
    PENDING: `${API_BASE_URL}/expenses/pending`,
    BY_ID: (id) => `${API_BASE_URL}/expenses/${id}`,
    SUBMIT: (id) => `${API_BASE_URL}/expenses/${id}/submit`,
    APPROVE: (id) => `${API_BASE_URL}/expenses/${id}/approve`,
    REJECT: (id) => `${API_BASE_URL}/expenses/${id}/reject`,
  },

  // Workflows
  WORKFLOWS: {
    BASE: `${API_BASE_URL}/workflows`,
    TEMPLATES: `${API_BASE_URL}/workflows/templates`,
    BY_ID: (id) => `${API_BASE_URL}/workflows/${id}`,
  },
};

// Request timeout
export const REQUEST_TIMEOUT = import.meta.env.VITE_REQUEST_TIMEOUT || 30000;

// File upload configuration
export const FILE_CONFIG = {
  MAX_SIZE: import.meta.env.VITE_MAX_FILE_SIZE || 5242880, // 5MB
  ALLOWED_TYPES: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
};

// UI Configuration
export const UI_CONFIG = {
  ITEMS_PER_PAGE: import.meta.env.VITE_ITEMS_PER_PAGE || 10,
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING === 'true',
};

// Token key for localStorage
export const TOKEN_KEY = 'expense_management_token';
export const REFRESH_TOKEN_KEY = 'expense_management_refresh_token';

// User roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

// Expense status
export const EXPENSE_STATUS = {
  DRAFT: 'DRAFT',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
};

// Expense categories
export const EXPENSE_CATEGORIES = {
  TRAVEL: 'TRAVEL',
  ACCOMMODATION: 'ACCOMMODATION',
  MEALS: 'MEALS',
  TRANSPORTATION: 'TRANSPORTATION',
  OFFICE_SUPPLIES: 'OFFICE_SUPPLIES',
  EQUIPMENT: 'EQUIPMENT',
  SOFTWARE: 'SOFTWARE',
  TRAINING: 'TRAINING',
  MARKETING: 'MARKETING',
  ENTERTAINMENT: 'ENTERTAINMENT',
  OTHER: 'OTHER',
};

// Workflow types
export const WORKFLOW_TYPES = {
  SEQUENTIAL: 'sequential',
  PERCENTAGE: 'percentage',
  SPECIFIC: 'specific',
  HYBRID: 'hybrid',
};

export default API_BASE_URL;