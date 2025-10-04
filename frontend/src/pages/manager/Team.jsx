import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  EyeIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const TeamOverview = () => {
  const { user, company } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamExpenses, setTeamExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberExpenses, setMemberExpenses] = useState([]);
  const [timeFilter, setTimeFilter] = useState('month'); // month, quarter, year
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalExpenses: 0,
    totalAmount: 0,
    pendingAmount: 0,
  });

  useEffect(() => {
    fetchTeamData();
  }, [timeFilter]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);

      // Fetch team members
      const teamResponse = await apiService.users.getSubordinates();
      const team = teamResponse.data.data;
      setTeamMembers(team);

      // Calculate date range based on filter
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeFilter) {
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(startDate.getMonth() - 1);
      }

      // Fetch team expenses
      const expensesResponse = await apiService.expenses.getAll({
        dateFrom: startDate.toISOString().split('T')[0],
        dateTo: endDate.toISOString().split('T')[0],
        submittedBy: team.map(member => member.userId).join(','),
      });
      const expenses = expensesResponse.data.data;
      setTeamExpenses(expenses);

      // Calculate stats
      const totalAmount = expenses
        .filter(exp => exp.status === 'APPROVED')
        .reduce((sum, exp) => sum + parseFloat(exp.amountInDefaultCurrency || 0), 0);
      
      const pendingAmount = expenses
        .filter(exp => exp.status === 'PENDING')
        .reduce((sum, exp) => sum + parseFloat(exp.amountInDefaultCurrency || 0), 0);

      setStats({
        totalMembers: team.length,
        totalExpenses: expenses.length,
        totalAmount,
        pendingAmount,
      });
    } catch (error) {
      console.error('Failed to fetch team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMemberExpenses = async (member) => {
    try {
      setSelectedMember(member);
      
      // Fetch specific member expenses
      const response = await apiService.expenses.getAll({
        submittedBy: member.userId,
        limit: 50,
      });
      setMemberExpenses(response.data.data);
    } catch (error) {
      console.error('Failed to fetch member expenses:', error);
      toast.error('Failed to load member expenses');
    }
  };

  const getMemberStats = (memberId) => {
    const memberExpenses = teamExpenses.filter(exp => exp.submittedBy?.userId === memberId);
    const totalAmount = memberExpenses
      .filter(exp => exp.status === 'APPROVED')
      .reduce((sum, exp) => sum + parseFloat(exp.amountInDefaultCurrency || 0), 0);
    const pendingCount = memberExpenses.filter(exp => exp.status === 'PENDING').length;
    
    return {
      totalExpenses: memberExpenses.length,
      totalAmount,
      pendingCount,
    };
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

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'month':
        return 'Last Month';
      case 'quarter':
        return 'Last Quarter';
      case 'year':
        return 'Last Year';
      default:
        return 'Last Month';
    }
  };

  const memberDetailModal = (
    <>
      {selectedMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedMember.firstName} {selectedMember.lastName} - Expense History
              </h3>
              <button
                onClick={() => {
                  setSelectedMember(null);
                  setMemberExpenses([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Member Info */}
              <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-xl">
                    {selectedMember.firstName[0]}{selectedMember.lastName[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h4>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                      {selectedMember.email}
                    </div>
                    {selectedMember.phoneNumber && (
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-1" />
                        {selectedMember.phoneNumber}
                      </div>
                    )}
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                      {selectedMember.department?.name || 'No department'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Member Expenses */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {memberExpenses.map((expense) => (
                      <tr key={expense.expenseId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {expense.description}
                          </div>
                          {expense.merchant && (
                            <div className="text-sm text-gray-500">
                              {expense.merchant}
                            </div>
                          )}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadgeClass(expense.status)}>
                            {expense.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(expense.submissionDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedMember(null);
                  setMemberExpenses([]);
                }}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Team Overview</h1>
          <p className="text-gray-600">Monitor your team's expense activity</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="input-field"
          >
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Team Members</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalMembers}</dd>
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
                <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalExpenses}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Amount ({getTimeFilterLabel()})</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {company?.defaultCurrency} {stats.totalAmount.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Amount</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {company?.defaultCurrency} {stats.pendingAmount.toLocaleString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Team Members ({teamMembers.length})</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {teamMembers.length > 0 ? (
            teamMembers.map((member) => {
              const memberStats = getMemberStats(member.userId);
              return (
                <div key={member.userId} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {member.firstName[0]}{member.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-4 w-4 mr-1" />
                            {member.email}
                          </div>
                          {member.phoneNumber && (
                            <div className="flex items-center">
                              <PhoneIcon className="h-4 w-4 mr-1" />
                              {member.phoneNumber}
                            </div>
                          )}
                          <div className="flex items-center">
                            <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                            {member.department?.name || 'No department'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          {memberStats.totalExpenses}
                        </p>
                        <p className="text-xs text-gray-500">Expenses</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-900">
                          {company?.defaultCurrency} {memberStats.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Total Amount</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-yellow-600">
                          {memberStats.pendingCount}
                        </p>
                        <p className="text-xs text-gray-500">Pending</p>
                      </div>
                      <button
                        onClick={() => handleViewMemberExpenses(member)}
                        className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members</h3>
              <p className="text-gray-500">
                You don't have any team members assigned yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Team Activity */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Team Activity</h3>
        </div>
        <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
          {teamExpenses.slice(0, 10).map((expense) => (
            <div key={expense.expenseId} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {expense.submittedBy?.firstName[0]}{expense.submittedBy?.lastName[0]}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {expense.submittedBy?.firstName} {expense.submittedBy?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {expense.description} • {expense.category}
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
            </div>
          ))}
        </div>
      </div>

      {memberDetailModal}
    </div>
  );
};

export default TeamOverview;