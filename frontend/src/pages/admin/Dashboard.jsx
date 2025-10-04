import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import {
  UsersIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const { user, company } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExpenses: 0,
    pendingExpenses: 0,
    approvedExpenses: 0,
    rejectedExpenses: 0,
    totalAmount: 0,
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch users
        const usersResponse = await apiService.users.getAll();
        const users = usersResponse.data.data;
        
        // Fetch expenses
        const expensesResponse = await apiService.expenses.getAll({ limit: 10 });
        const expenses = expensesResponse.data.data;
        
        // Calculate stats
        const totalUsers = users.length;
        const totalExpenses = expenses.length;
        const pendingExpenses = expenses.filter(exp => exp.status === 'PENDING').length;
        const approvedExpenses = expenses.filter(exp => exp.status === 'APPROVED').length;
        const rejectedExpenses = expenses.filter(exp => exp.status === 'REJECTED').length;
        const totalAmount = expenses
          .filter(exp => exp.status === 'APPROVED')
          .reduce((sum, exp) => sum + parseFloat(exp.amountInDefaultCurrency || 0), 0);

        setStats({
          totalUsers,
          totalExpenses,
          pendingExpenses,
          approvedExpenses,
          rejectedExpenses,
          totalAmount,
        });
        
        setRecentExpenses(expenses.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      name: 'Total Users',
      value: stats.totalUsers,
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Total Expenses',
      value: stats.totalExpenses,
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Pending Approval',
      value: stats.pendingExpenses,
      icon: ClockIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Approved',
      value: stats.approvedExpenses,
      icon: CheckCircleIcon,
      color: 'bg-emerald-500',
    },
    {
      name: 'Rejected',
      value: stats.rejectedExpenses,
      icon: XCircleIcon,
      color: 'bg-red-500',
    },
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'status-badge-approved';
      case 'PENDING':
        return 'status-badge-pending';
      case 'REJECTED':
        return 'status-badge-rejected';
      case 'DRAFT':
        return 'status-badge-draft';
      default:
        return 'status-badge-draft';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.firstName}! Here's what's happening with {company?.name}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Amount Card */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Total Approved Amount</h3>
            <p className="text-3xl font-bold text-green-600">
              {company?.defaultCurrency} {stats.totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Expenses</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentExpenses.length > 0 ? (
            recentExpenses.map((expense) => (
              <div key={expense.expenseId} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {expense.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {expense.submittedBy?.firstName} {expense.submittedBy?.lastName} • 
                      {expense.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {company?.defaultCurrency} {parseFloat(expense.amountInDefaultCurrency || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(expense.submissionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={getStatusBadgeClass(expense.status)}>
                    {expense.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No expenses found</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-6 hover:shadow-medium transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <UsersIcon className="h-8 w-8 text-primary-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-500">Add, edit, and manage user accounts</p>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-medium transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <Cog6ToothIcon className="h-8 w-8 text-primary-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Workflows</h3>
              <p className="text-sm text-gray-500">Configure approval workflows</p>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-medium transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <CurrencyDollarIcon className="h-8 w-8 text-primary-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">All Expenses</h3>
              <p className="text-sm text-gray-500">View and manage all expenses</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;