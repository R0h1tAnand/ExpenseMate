import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { EXPENSE_STATUS, EXPENSE_CATEGORIES } from '../../config/constants';
import {
  CurrencyDollarIcon,
  EyeIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ManagerExpenses = () => {
  const { user, company } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    submittedBy: '',
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    fetchExpenses();
    fetchTeamMembers();
  }, [filters]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Apply filters
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.submittedBy) params.submittedBy = filters.submittedBy;

      // Get team expenses (manager can see team member expenses)
      const response = await apiService.expenses.getAll(params);
      const expenseData = Array.isArray(response.data.data) ? response.data.data : [];
      setExpenses(expenseData);

      // Calculate stats
      const stats = {
        total: expenseData.length,
        pending: expenseData.filter(exp => exp.status === 'PENDING').length,
        approved: expenseData.filter(exp => exp.status === 'APPROVED').length,
        rejected: expenseData.filter(exp => exp.status === 'REJECTED').length,
        totalAmount: expenseData
          .filter(exp => exp.status === 'APPROVED')
          .reduce((sum, exp) => sum + parseFloat(exp.amountInDefaultCurrency || 0), 0),
      };
      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await apiService.users.getSubordinates();
      setTeamMembers(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
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

  const resetFilters = () => {
    setFilters({
      status: '',
      category: '',
      dateFrom: '',
      dateTo: '',
      submittedBy: '',
    });
  };

  const handleExportExpenses = async () => {
    try {
      const params = { ...filters, export: true };
      const response = await apiService.expenses.exportTeamExpenses(params);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `team-expenses-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Expenses exported successfully');
    } catch (error) {
      console.error('Failed to export expenses:', error);
      toast.error('Failed to export expenses');
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
          <h1 className="text-2xl font-bold text-gray-900">Team Expenses</h1>
          <p className="text-gray-600">Monitor and manage your team's expenses</p>
        </div>
        <button
          onClick={handleExportExpenses}
          className="btn-secondary flex items-center space-x-2"
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-bold text-sm">{stats.pending}</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.pending}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-bold text-sm">{stats.approved}</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.approved}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 font-bold text-sm">{stats.rejected}</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.rejected}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Amount</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {company?.defaultCurrency} {stats.totalAmount.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
          </h3>
          <button
            onClick={resetFilters}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field"
            >
              <option value="">All Statuses</option>
              {Object.values(EXPENSE_STATUS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input-field"
            >
              <option value="">All Categories</option>
              {Object.values(EXPENSE_CATEGORIES).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Member
            </label>
            <select
              value={filters.submittedBy}
              onChange={(e) => setFilters({ ...filters, submittedBy: e.target.value })}
              className="input-field"
            >
              <option value="">All Team Members</option>
              {teamMembers.map(member => (
                <option key={member.userId} value={member.userId}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Team Expenses ({expenses.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense.expenseId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {expense.description}
                      </div>
                      <div className="text-sm text-gray-500">
                        {expense.category} • {expense.merchant || 'No merchant'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {company?.defaultCurrency} {parseFloat(expense.amountInDefaultCurrency || 0).toLocaleString()}
                    </div>
                    {expense.currency !== company?.defaultCurrency && (
                      <div className="text-xs text-gray-500">
                        {expense.currency} {parseFloat(expense.amount).toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-xs">
                            {expense.submittedBy?.firstName[0]}{expense.submittedBy?.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {expense.submittedBy?.firstName} {expense.submittedBy?.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {expense.submittedBy?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadgeClass(expense.status)}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {new Date(expense.submissionDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {/* Handle view expense */}}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {expenses.length === 0 && (
          <div className="p-8 text-center">
            <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-500">
              No team expenses match your current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerExpenses;