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
} from '@heroicons/react/24/outline';
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

      // Fetch team expenses for current month (only if we have team members)
      let teamExpenses = [];
      if (team.length > 0) {
        const currentMonth = new Date();
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
        const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
        
        try {
          const expensesResponse = await apiService.expenses.getAll({
            dateFrom: firstDay.toISOString().split('T')[0],
            dateTo: lastDay.toISOString().split('T')[0],
            submittedBy: team.map(member => member.userId).join(','),
          });
          teamExpenses = Array.isArray(expensesResponse.data.data) ? expensesResponse.data.data : [];
        } catch (error) {
          console.error('Failed to fetch team expenses:', error);
          teamExpenses = [];
        }
      }

      // Get recent approvals (approved/rejected in last 30 days)
      let approvals = [];
      try {
        const last30Days = new Date();
        last30Days.setDate(last30Days.getDate() - 30);
        
        const approvalsResponse = await apiService.expenses.getAll({
          dateFrom: last30Days.toISOString().split('T')[0],
          status: 'APPROVED,REJECTED',
          approver: user.userId,
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
      const payload = {
        comments: `Quick ${action.toLowerCase()} from dashboard`,
      };

      if (action === 'APPROVED') {
        await apiService.expenses.approve(expenseId, payload);
      } else if (action === 'REJECTED') {
        await apiService.expenses.reject(expenseId, payload);
      }
      
      toast.success(`Expense ${action.toLowerCase()} successfully`);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error(`Failed to ${action} expense:`, error);
      toast.error(`Failed to ${action.toLowerCase()} expense`);
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
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.firstName}! Here's your team's expense overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-yellow-500">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pending Approvals
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.pendingApprovals}
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
                  Approved This Month
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.approvedThisMonth}
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
                  Rejected This Month
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.rejectedThisMonth}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-blue-500">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Team Expenses
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.teamExpenses}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 rounded-lg bg-purple-500">
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
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending Approvals */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              {stats.pendingApprovals} pending
            </span>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {pendingExpenses.length > 0 ? (
              pendingExpenses.map((expense) => (
                <div key={expense.expenseId} className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-xs">
                            {expense.submittedBy?.firstName[0]}{expense.submittedBy?.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {expense.submittedBy?.firstName} {expense.submittedBy?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(expense.submissionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {company?.defaultCurrency} {parseFloat(expense.amountInDefaultCurrency || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900">
                      {expense.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {expense.category} • {expense.merchant || 'No merchant'}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleQuickAction(expense.expenseId, 'APPROVED')}
                        className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full hover:bg-green-200"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleQuickAction(expense.expenseId, 'REJECTED')}
                        className="px-3 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full hover:bg-red-200"
                      >
                        Reject
                      </button>
                    </div>
                    <button className="text-primary-600 hover:text-primary-800 text-sm">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending approvals</h3>
                <p className="text-gray-500">
                  All caught up! No expenses waiting for your approval.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Approvals */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Approvals</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
            {recentApprovals.length > 0 ? (
              recentApprovals.map((expense) => (
                <div key={expense.expenseId} className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-xs">
                            {expense.submittedBy?.firstName[0]}{expense.submittedBy?.lastName[0]}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {expense.submittedBy?.firstName} {expense.submittedBy?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(expense.submissionDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={getStatusBadgeClass(expense.status)}>
                      {expense.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-900">
                        {expense.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {expense.category}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {company?.defaultCurrency} {parseFloat(expense.amountInDefaultCurrency || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No recent approvals</h3>
                <p className="text-gray-500">
                  Your recent approval activity will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Your Team</h3>
        </div>
        <div className="p-6">
          {teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((member) => (
                <div key={member.userId} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {member.firstName[0]}{member.lastName[0]}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.firstName} {member.lastName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {member.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      {member.department?.name || 'No department'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members</h3>
              <p className="text-gray-500">
                You don't have any team members assigned yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-6 hover:shadow-medium transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <ClockIcon className="h-8 w-8 text-primary-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Approve Expenses</h3>
              <p className="text-sm text-gray-500">Review and approve pending expenses</p>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-medium transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <UserGroupIcon className="h-8 w-8 text-primary-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Team Overview</h3>
              <p className="text-sm text-gray-500">View team expense reports</p>
            </div>
          </div>
        </div>

        <div className="card p-6 hover:shadow-medium transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3">
            <CurrencyDollarIcon className="h-8 w-8 text-primary-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Expense Reports</h3>
              <p className="text-sm text-gray-500">Generate detailed reports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;