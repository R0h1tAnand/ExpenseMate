import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CalendarIcon,
  EyeIcon,
  DocumentTextIcon,
  BellIcon,
  PlusIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ManagerDashboard = () => {
  const { user, company } = useAuth();
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    teamExpenses: 0,
    totalAmount: 0,
  });
  const [pendingExpenses, setPendingExpenses] = useState([]);
  const [recentApprovals, setRecentApprovals] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickApprovalLoading, setQuickApprovalLoading] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch pending approvals
      const pendingResponse = await apiService.expenses.getPending();
      const pending = Array.isArray(pendingResponse.data.data) ? pendingResponse.data.data : [];
      setPendingExpenses(pending.slice(0, 5)); // Show top 5

      // Fetch team members
      const teamResponse = await apiService.users.getSubordinates();
      const team = Array.isArray(teamResponse.data.data) ? teamResponse.data.data : [];
      setTeamMembers(team);

      // Fetch team expenses for current month
      let teamExpenses = [];
      const currentMonth = new Date();
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      try {
        const expensesResponse = await apiService.expenses.getAll({
          dateFrom: firstDay.toISOString().split('T')[0],
          dateTo: lastDay.toISOString().split('T')[0],
        });
        teamExpenses = Array.isArray(expensesResponse.data.data) ? expensesResponse.data.data : [];
      } catch (error) {
        console.error('Failed to fetch team expenses:', error);
        teamExpenses = [];
      }

      // Get recent approvals (approved/rejected in last 7 days)
      let approvals = [];
      try {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        
        const approvalsResponse = await apiService.expenses.getAll({
          dateFrom: last7Days.toISOString().split('T')[0],
          status: 'APPROVED,REJECTED',
        });
        approvals = Array.isArray(approvalsResponse.data.data) ? approvalsResponse.data.data : [];
      } catch (error) {
        console.error('Failed to fetch recent approvals:', error);
        approvals = [];
      }
      setRecentApprovals(approvals.slice(0, 5));

      // Calculate stats
      const approvedThisMonth = teamExpenses.filter(exp => exp.status === 'APPROVED').length;
      const rejectedThisMonth = teamExpenses.filter(exp => exp.status === 'REJECTED').length;
      const totalAmount = teamExpenses
        .filter(exp => exp.status === 'APPROVED')
        .reduce((sum, exp) => sum + parseFloat(exp.amountInDefaultCurrency || 0), 0);

      setStats({
        pendingApprovals: pending.length,
        approvedThisMonth,
        rejectedThisMonth,
        teamExpenses: teamExpenses.length,
        totalAmount,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (expenseId, action) => {
    try {
      setQuickApprovalLoading(prev => ({ ...prev, [expenseId]: true }));
      
      const payload = {
        comments: `Quick ${action.toLowerCase()} from manager dashboard`,
      };

      if (action === 'APPROVED') {
        await apiService.expenses.approve(expenseId, payload);
        toast.success('Expense approved successfully!');
      } else if (action === 'REJECTED') {
        await apiService.expenses.reject(expenseId, payload);
        toast.success('Expense rejected successfully!');
      }
      
      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error(`Failed to ${action} expense:`, error);
      const errorMessage = error.response?.data?.message || `Failed to ${action.toLowerCase()} expense`;
      toast.error(errorMessage);
    } finally {
      setQuickApprovalLoading(prev => ({ ...prev, [expenseId]: false }));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200';
      case 'PENDING':
        return 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'REJECTED':
        return 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200';
      case 'DRAFT':
        return 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200';
      default:
        return 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'PENDING':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case 'REJECTED':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      case 'DRAFT':
        return <DocumentTextIcon className="h-4 w-4 text-gray-600" />;
      default:
        return <DocumentTextIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading manager dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Manager Dashboard</h1>
                <p className="text-purple-100 text-lg">
                  Welcome back, {user?.firstName}! Manage your team's expense approvals.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                {stats.pendingApprovals > 0 && (
                  <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 shadow-lg">
                    <BellIcon className="h-5 w-5" />
                    <span className="font-medium">{stats.pendingApprovals} Pending</span>
                  </div>
                )}
                <Link
                  to="/dashboard/approvals"
                  className="inline-flex items-center px-6 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg"
                >
                  View All Approvals
                  <ArrowRightIcon className="h-5 w-5 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Approvals</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingApprovals}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved This Month</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvedThisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected This Month</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejectedThisMonth}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Team Members</p>
                <p className="text-2xl font-bold text-blue-600">{teamMembers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CurrencyDollarIcon className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Approved</p>
                <p className="text-lg font-bold text-emerald-600">
                  {company?.defaultCurrency} {stats.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Pending Approvals */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                    <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                      <ClockIcon className="h-5 w-5 text-white" />
                    </div>
                    Pending Approvals
                  </h3>
                  <Link
                    to="/dashboard/approvals"
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                  >
                    View All ({stats.pendingApprovals})
                  </Link>
                </div>
                <p className="text-gray-600 mt-1">Review and approve employee expense submissions</p>
              </div>

              <div className="divide-y divide-gray-200">
                {pendingExpenses.length > 0 ? (
                  pendingExpenses.map((expense) => (
                    <div key={expense.expenseId} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {expense.description}
                            </h4>
                            <div className="flex items-center text-sm text-gray-500 space-x-4 mb-2">
                              <span className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-1" />
                                {expense.submittedBy?.firstName} {expense.submittedBy?.lastName}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {new Date(expense.expenseDate || expense.submissionDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-lg font-bold text-gray-900">
                                  {company?.defaultCurrency} {parseFloat(expense.amountInDefaultCurrency || 0).toLocaleString()}
                                </span>
                                {expense.originalCurrency !== company?.defaultCurrency && (
                                  <span className="text-sm text-gray-500 ml-2">
                                    ({expense.originalCurrency} {parseFloat(expense.originalAmount || 0).toLocaleString()})
                                  </span>
                                )}
                                <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {expense.category}
                                </span>
                              </div>
                            </div>
                            {expense.notes && (
                              <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-3 rounded-lg">
                                {expense.notes.length > 100 ? `${expense.notes.substring(0, 100)}...` : expense.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleQuickAction(expense.expenseId, 'APPROVED')}
                              disabled={quickApprovalLoading[expense.expenseId]}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                            >
                              {quickApprovalLoading[expense.expenseId] ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-green-600 mr-1"></div>
                              ) : (
                                <CheckCircleIcon className="h-3 w-3 mr-1" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleQuickAction(expense.expenseId, 'REJECTED')}
                              disabled={quickApprovalLoading[expense.expenseId]}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                              {quickApprovalLoading[expense.expenseId] ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-red-600 mr-1"></div>
                              ) : (
                                <XCircleIcon className="h-3 w-3 mr-1" />
                              )}
                              Reject
                            </button>
                          </div>
                          <Link
                            to={`/dashboard/expenses/${expense.expenseId}`}
                            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors"
                          >
                            <EyeIcon className="h-3 w-3 mr-1" />
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircleIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                    <p className="text-gray-500">No pending expense approvals at the moment.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Overview & Recent Activity */}
          <div className="space-y-8">
            {/* Team Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                    <UserGroupIcon className="h-5 w-5 text-white" />
                  </div>
                  Team Overview
                </h3>
              </div>
              <div className="p-6">
                {teamMembers.length > 0 ? (
                  <div className="space-y-4">
                    {teamMembers.slice(0, 5).map((member) => (
                      <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {member.firstName?.[0]}{member.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                          {member.role}
                        </span>
                      </div>
                    ))}
                    {teamMembers.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{teamMembers.length - 5} more team members
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No team members assigned yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                    <DocumentTextIcon className="h-5 w-5 text-white" />
                  </div>
                  Recent Activity
                </h3>
              </div>
              <div className="p-6">
                {recentApprovals.length > 0 ? (
                  <div className="space-y-4">
                    {recentApprovals.map((expense) => (
                      <div key={expense.expenseId} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getStatusIcon(expense.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 truncate">
                            {expense.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {company?.defaultCurrency} {parseFloat(expense.amountInDefaultCurrency || 0).toLocaleString()} • 
                            {new Date(expense.updatedAt || expense.submissionDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={getStatusBadgeClass(expense.status)}>
                          {expense.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activity to show.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <Link
                  to="/dashboard/approvals"
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Review All Approvals
                </Link>
                
                <Link
                  to="/dashboard/team"
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  Manage Team
                </Link>

                <Link
                  to="/dashboard/expenses"
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  View All Expenses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;