import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../config/constants';

// Protected route component
export const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Public route component (redirects to dashboard if already authenticated)
export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect to appropriate dashboard based on role
    switch (user?.role) {
      case USER_ROLES.ADMIN:
        return <Navigate to="/admin" replace />;
      case USER_ROLES.MANAGER:
        return <Navigate to="/manager" replace />;
      case USER_ROLES.EMPLOYEE:
        return <Navigate to="/employee" replace />;
      default:
        return <Navigate to="/employee" replace />;
    }
  }

  return children;
};

// Role-based route component
export const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;