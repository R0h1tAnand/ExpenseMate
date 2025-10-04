import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_ROLES } from '../config/constants';
import { apiService } from '../services/api';

// Initial state
const initialState = {
  user: null,
  company: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        company: action.payload.company,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (token) {
        try {
          const response = await apiService.auth.getProfile();
          console.log('Profile response:', response.data);
          
          // The backend returns the user data directly in response.data
          const profileResponse = response.data;
          const user = profileResponse.data || profileResponse; // Handle both structures
          
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: user,
              company: user.company,
            },
          });
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      console.log('Attempting login with:', { email: credentials.email });
      
      const response = await apiService.auth.login(credentials);
      console.log('Login response:', response.data);
      
      // The backend returns the data directly in response.data
      const loginResponse = response.data;
      const user = loginResponse.data?.user;
      const company = loginResponse.data?.company;
      const tokens = loginResponse.data?.tokens;
      
      console.log('AuthContext: Login parsed user:', user);
      console.log('AuthContext: Login parsed company:', company);
      console.log('AuthContext: Login parsed tokens:', tokens);
      
      // Store tokens
      localStorage.setItem(TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, company },
      });

      return { success: true, user };
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Signup function
  const signup = async (signupData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      console.log('AuthContext: Starting signup with data:', signupData);
      console.log('AuthContext: Making API call to:', 'http://localhost:5000/api/v1/auth/signup');
      
      const response = await apiService.auth.signup(signupData);
      console.log('AuthContext: Signup API response:', response);
      console.log('AuthContext: Response data:', response.data);
      console.log('AuthContext: Response data keys:', Object.keys(response.data));
      
      // The backend returns the data directly in response.data
      const signupResponse = response.data;
      const user = signupResponse.data?.user;
      const company = signupResponse.data?.company;
      const tokens = signupResponse.data?.tokens;
      
      console.log('AuthContext: Parsed user:', user);
      console.log('AuthContext: Parsed company:', company);
      console.log('AuthContext: Parsed tokens:', tokens);
      
      if (!user || !company || !tokens || !tokens.accessToken) {
        console.error('AuthContext: Missing required data in response');
        throw new Error('Invalid response: missing required user, company, or token data');
      }
      
      // Store tokens
      localStorage.setItem(TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, company },
      });

      return { success: true, user };
    } catch (error) {
      console.error('AuthContext: Signup error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await apiService.auth.updateProfile(profileData);
      const updatedUser = response.data.data || response.data;
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_PROFILE,
        payload: updatedUser,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      return { success: false, error: errorMessage };
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      await apiService.auth.changePassword(passwordData);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      return { success: false, error: errorMessage };
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Helper functions
  const isAdmin = () => state.user?.role === USER_ROLES.ADMIN;
  const isManager = () => state.user?.role === USER_ROLES.MANAGER;
  const isEmployee = () => state.user?.role === USER_ROLES.EMPLOYEE;

  const value = {
    ...state,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    clearError,
    isAdmin,
    isManager,
    isEmployee,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;