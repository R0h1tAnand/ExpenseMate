import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import {
  PlusIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const EmployeeDashboard = () => {
  const { user, company } = useAuth();
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingExpenses: 0,
    approvedExpenses: 0,
    rejectedExpenses: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's expenses
      const response = await apiService.expenses.getAll({ 
        submittedBy: user.userId,
        limit: 10 
      });
      const expenses = response.data.data;
      
      setRecentExpenses(expenses.slice(0, 5));

      // Calculate stats
      const totalExpenses = expenses.length;
      const pendingExpenses = expenses.filter(exp => exp.status === 'PENDING').length;
      const approvedExpenses = expenses.filter(exp => exp.status === 'APPROVED').length;
      const rejectedExpenses = expenses.filter(exp => exp.status === 'REJECTED').length;
      
      const totalAmount = expenses
        .filter(exp => exp.status === 'APPROVED')
        .reduce((sum, exp) => sum + parseFloat(exp.amountInDefaultCurrency || 0), 0);
      
      const pendingAmount = expenses
        .filter(exp => exp.status === 'PENDING')
        .reduce((sum, exp) => sum + parseFloat(exp.amountInDefaultCurrency || 0), 0);

      setStats({
        totalExpenses,
        pendingExpenses,
        approvedExpenses,
        rejectedExpenses,
        totalAmount,
        pendingAmount,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'REJECTED':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'DRAFT':
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600">
            Here's your expense overview for {company?.name}.
          </p>
        </div>
        <Link
          to="/dashboard/expenses/new"
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Expense</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-500">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Expenses
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.totalExpenses}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-500">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pending
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.pendingExpenses}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-green-500">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Approved
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.approvedExpenses}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-red-500">
              <XCircleIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Rejected
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.rejectedExpenses}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-emerald-500">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Approved
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {company?.defaultCurrency} {stats.totalAmount.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-orange-500">
              <CurrencyDollarIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pending Amount
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {company?.defaultCurrency} {stats.pendingAmount.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Expenses */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Recent Expenses</h3>
              <Link
                to="/dashboard/expenses"
                className="text-sm text-primary-600 hover:text-primary-800"
              >
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {recentExpenses.length > 0 ? (
                recentExpenses.map((expense) => (
                  <div key={expense.expenseId} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(expense.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {expense.description}
                          </p>
                          <p className="text-sm text-gray-500">
                            {expense.category} • {expense.merchant || 'No merchant'}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {new Date(expense.submissionDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {company?.defaultCurrency} {parseFloat(expense.amountInDefaultCurrency || 0).toLocaleString()}
                          </p>
                          {expense.currency !== company?.defaultCurrency && (
                            <p className="text-xs text-gray-500">
                              {expense.currency} {parseFloat(expense.amount).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <span className={getStatusBadgeClass(expense.status)}>
                          {expense.status}
                        </span>
                        <Link
                          to={`/dashboard/expenses/${expense.expenseId}`}
                          className="p-1 text-primary-600 hover:text-primary-800"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
                  <p className="text-gray-500 mb-4">
                    Get started by creating your first expense report.
                  </p>
                  <Link to="/dashboard/employee/submit" className="btn-primary">
                    Create Expense
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions & Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-4">
              <Link
                to="/dashboard/expenses/new"
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Expense
              </Link>
              
              <Link
                to="/dashboard/expenses"
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                View All Expenses
              </Link>

              <Link
                to="/dashboard/profile"
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Update Profile
              </Link>
            </div>
          </div>

          {/* Status Summary */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Status Summary</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="h-5 w-5 text-yellow-500" />
                    <span className="text-sm text-gray-700">Pending Approval</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.pendingExpenses}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700">Approved</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.approvedExpenses}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-gray-700">Rejected</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {stats.rejectedExpenses}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      This Month's Total
                    </span>
                    <span className="text-lg font-bold text-primary-600">
                      {company?.defaultCurrency} {(stats.totalAmount + stats.pendingAmount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">💡 Tips</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3 text-sm text-gray-600">
                <p>• Always attach receipts to your expenses for faster approval</p>
                <p>• Submit expenses within 30 days of the expense date</p>
                <p>• Provide detailed descriptions for business justification</p>
                <p>• Check your company's expense policy for category limits</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Timeline */}
      {recentExpenses.length > 0 && (
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {recentExpenses.slice(0, 3).map((expense, expenseIdx) => (
                  <li key={expense.expenseId}>
                    <div className="relative pb-8">
                      {expenseIdx !== recentExpenses.slice(0, 3).length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                            {getStatusIcon(expense.status)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Created expense{' '}
                              <span className="font-medium text-gray-900">
                                {expense.description}
                              </span>{' '}
                              for{' '}
                              <span className="font-medium text-gray-900">
                                {company?.defaultCurrency} {parseFloat(expense.amountInDefaultCurrency || 0).toLocaleString()}
                              </span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {new Date(expense.submissionDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;