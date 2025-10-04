import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import { USER_ROLES } from './config/constants';

// Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/SimpleSignup';

// Home page
import Home from './pages/Home';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminWorkflows from './pages/admin/Workflows';
import AdminCompany from './pages/admin/Company';
import AdminExpenses from './pages/admin/Expenses';

// Manager pages
import ManagerDashboard from './pages/manager/Dashboard';
import ManagerExpenses from './pages/manager/Expenses';
import ManagerApprovals from './pages/manager/Approvals';
import ManagerTeam from './pages/manager/Team';

// Employee pages
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeExpenses from './pages/employee/ExpenseList';
import EmployeeSubmit from './pages/employee/NewExpense';

// Shared pages
import ExpenseDetails from './pages/shared/ExpenseDetails';
import Profile from './pages/shared/Profile';
import Unauthorized from './pages/shared/Unauthorized';
import NotFound from './pages/shared/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public home route - accessible to everyone */}
            <Route path="/" element={<Home />} />
            
            {/* Public auth routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />

            {/* Protected dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Admin routes */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN]}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/workflows"
                element={
                  <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN]}>
                    <AdminWorkflows />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/company"
                element={
                  <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN]}>
                    <AdminCompany />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/expenses"
                element={
                  <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN]}>
                    <AdminExpenses />
                  </ProtectedRoute>
                }
              />

              {/* Manager routes */}
              <Route
                path="manager"
                element={
                  <ProtectedRoute requiredRoles={[USER_ROLES.MANAGER]}>
                    <ManagerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="manager/expenses"
                element={
                  <ProtectedRoute requiredRoles={[USER_ROLES.MANAGER]}>
                    <ManagerExpenses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="manager/approvals"
                element={
                  <ProtectedRoute requiredRoles={[USER_ROLES.MANAGER]}>
                    <ManagerApprovals />
                  </ProtectedRoute>
                }
              />
              <Route
                path="manager/team"
                element={
                  <ProtectedRoute requiredRoles={[USER_ROLES.MANAGER]}>
                    <ManagerTeam />
                  </ProtectedRoute>
                }
              />

              {/* Employee routes */}
              <Route
                path="employee"
                element={
                  <ProtectedRoute requiredRoles={[USER_ROLES.EMPLOYEE]}>
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="employee/expenses"
                element={
                  <ProtectedRoute requiredRoles={[USER_ROLES.EMPLOYEE]}>
                    <EmployeeExpenses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="employee/submit"
                element={
                  <ProtectedRoute requiredRoles={[USER_ROLES.EMPLOYEE]}>
                    <EmployeeSubmit />
                  </ProtectedRoute>
                }
              />

              {/* Shared routes */}
              <Route
                path="expense/:id"
                element={
                  <ProtectedRoute>
                    <ExpenseDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Redirect dashboard root to appropriate dashboard */}
              <Route
                path="/dashboard"
                element={<Navigate to="/dashboard/employee" replace />}
              />
            </Route>

            {/* Error pages */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
