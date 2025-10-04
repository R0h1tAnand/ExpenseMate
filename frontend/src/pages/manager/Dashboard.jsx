import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ClockIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
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
  const [allTeamExpenses, setAllTeamExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Current user:', user);
      console.log('User role:', user?.role);
      console.log('User ID:', user?.userId);

      // Get pending approvals
      let pending = [];
      try {
        const pendingResponse = await apiService.expenses.getPending();
        console.log('Pending Response:', pendingResponse.data);
        pending = Array.isArray(pendingResponse.data.data) ? pendingResponse.data.data : [];
        console.log('Pending expenses:', pending);
      } catch (error) {
        console.error('Failed to fetch pending approvals:', error);
        pending = [];
      }
      setPendingExpenses(pending.slice(0, 5)); // Show first 5 for dashboard

      // Get team members
      const teamResponse = await apiService.users.getSubordinates();
      console.log('Team Response:', teamResponse.data);
      const team = Array.isArray(teamResponse.data.data) ? teamResponse.data.data : [];
      console.log('Team members:', team);
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
        console.log('Team Expenses Response:', expensesResponse.data);
        teamExpenses = Array.isArray(expensesResponse.data.data) ? expensesResponse.data.data : [];
        console.log('Team expenses:', teamExpenses);
      } catch (error) {
        console.error('Failed to fetch team expenses:', error);
        teamExpenses = [];
      }

      // Get all team expenses (not date-filtered) for the main display
      let allExpenses = [];
      try {
        const allExpensesResponse = await apiService.expenses.getAll({
          limit: 50, // Get recent 50 expenses
        });
        console.log('All Expenses Response:', allExpensesResponse.data);
        allExpenses = Array.isArray(allExpensesResponse.data.data) ? allExpensesResponse.data.data : [];
        console.log('All team expenses:', allExpenses);
      } catch (error) {
        console.error('Failed to fetch all team expenses:', error);
        allExpenses = [];
      }
      setAllTeamExpenses(allExpenses);

      // Get recent approvals (approved/rejected in last 7 days)
      let approvals = [];
      try {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        
        // Get approved expenses
        const approvedResponse = await apiService.expenses.getAll({
          dateFrom: last7Days.toISOString().split('T')[0],
          status: 'APPROVED',
        });
        
        // Get rejected expenses
        const rejectedResponse = await apiService.expenses.getAll({
          dateFrom: last7Days.toISOString().split('T')[0],
          status: 'REJECTED',
        });
        
        const approvedExpenses = Array.isArray(approvedResponse.data.data) ? approvedResponse.data.data : [];
        const rejectedExpenses = Array.isArray(rejectedResponse.data.data) ? rejectedResponse.data.data : [];
        
        // Combine and sort by date
        approvals = [...approvedExpenses, ...rejectedExpenses]
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
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
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (expenseId, action) => {
    try {
      if (action === 'APPROVED') {
        await apiService.expenses.approve(expenseId, {
          comment: 'Quick approval from dashboard'
        });
        toast.success('Expense approved successfully');
      } else if (action === 'REJECTED') {
        await apiService.expenses.reject(expenseId, {
          comment: 'Quick rejection from dashboard'
        });
        toast.success('Expense rejected successfully');
      }

      // Refresh data
      fetchDashboardData();
    } catch (error) {
      console.error('Error processing expense action:', error);
      toast.error(`Failed to ${action.toLowerCase()} expense`);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full';
      case 'APPROVED':
        return 'px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full';
      case 'REJECTED':
        return 'px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full';
      case 'DRAFT':
        return 'px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full';
      default:
        return 'px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'TRAVEL':
      case 'TRANSPORTATION':
        return <ClockIcon className="h-4 w-4 text-blue-600" />;
      case 'MEALS':
        return <DocumentTextIcon className="h-4 w-4 text-orange-600" />;
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
                  Welcome back, {user?.firstName}! Here's what's happening with your team.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
                  <p className="text-purple-100 text-sm">Pending</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{teamMembers.length}</p>
                  <p className="text-purple-100 text-sm">Team Size</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Approved</p>
                <p className="text-2xl font-bold text-blue-600">
                  {company?.defaultCurrency} {stats.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Pending Approvals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Pending Approvals</h3>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                {pendingExpenses.length} pending
              </span>
            </div>
            <div className="overflow-hidden">
              {pendingExpenses.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {pendingExpenses.map((expense) => (
                    <div key={expense.expenseId} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-purple-600 font-medium text-sm">
                                {expense.submittedBy?.firstName?.[0] || 'U'}{expense.submittedBy?.lastName?.[0] || 'N'}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {expense.description}
                              </p>
                              {getCategoryIcon(expense.category)}
                            </div>
                            <p className="text-sm text-gray-500">
                              {expense.submittedBy?.firstName} {expense.submittedBy?.lastName} • 
                              {expense.category} • 
                              {new Date(expense.submissionDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {company?.defaultCurrency} {parseFloat(expense.amountInDefaultCurrency || 0).toLocaleString()}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => handleQuickAction(expense.expenseId, 'APPROVED')}
                              className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full hover:bg-green-200 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleQuickAction(expense.expenseId, 'REJECTED')}
                              className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full hover:bg-red-200 transition-colors"
                            >
                              Reject
                            </button>
                            <button className="px-2 py-1 text-purple-600 hover:text-purple-800 transition-colors">
                              <EyeIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClockIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
                  <p className="text-gray-500">
                    All caught up! No expenses waiting for your approval.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* All Team Expenses Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">All Team Expenses</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {allTeamExpenses.length} total
              </span>
            </div>
            <div className="overflow-hidden">
              {allTeamExpenses.length > 0 ? (
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {allTeamExpenses.map((expense) => (
                    <div key={expense.expenseId} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium text-sm">
                                {expense.submittedBy?.firstName?.[0] || 'U'}{expense.submittedBy?.lastName?.[0] || 'N'}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {expense.description}
                              </p>
                              <span className={getStatusBadgeClass(expense.status)}>
                                {expense.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {expense.submittedBy?.firstName} {expense.submittedBy?.lastName} • 
                              {expense.category} • 
                              {new Date(expense.submissionDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {company?.defaultCurrency} {parseFloat(expense.amountInDefaultCurrency || 0).toLocaleString()}
                          </p>
                          {expense.status === 'PENDING' && (
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => handleQuickAction(expense.expenseId, 'APPROVED')}
                                className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full hover:bg-green-200 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleQuickAction(expense.expenseId, 'REJECTED')}
                                className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full hover:bg-red-200 transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Team Expenses</h3>
                  <p className="text-gray-500">
                    No expenses have been submitted by your team members yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                {recentApprovals.length > 0 ? (
                  <div className="space-y-4">
                    {recentApprovals.map((expense) => (
                      <div key={expense.expenseId} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {expense.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {expense.submittedBy?.firstName} {expense.submittedBy?.lastName}
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