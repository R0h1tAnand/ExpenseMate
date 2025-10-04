import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { EXPENSE_STATUS } from '../../config/constants';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const ApprovalCenter = () => {
  const { user, company } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [filter, setFilter] = useState('PENDING');
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchExpenses();
  }, [filter]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let response;
      
      if (filter === 'PENDING') {
        response = await apiService.expenses.getPendingApprovals();
      } else {
        response = await apiService.expenses.getAll({
          status: filter,
          approver: user.userId,
        });
      }
      
      const expenseData = response.data.data;
      setExpenses(expenseData);

      // Calculate stats
      const allPendingResponse = await apiService.expenses.getPendingApprovals();
      const pending = allPendingResponse.data.data;
      
      const approvedResponse = await apiService.expenses.getAll({
        status: 'APPROVED',
        approver: user.userId,
      });
      const approved = approvedResponse.data.data;
      
      const rejectedResponse = await apiService.expenses.getAll({
        status: 'REJECTED',
        approver: user.userId,
      });
      const rejected = rejectedResponse.data.data;

      setStats({
        pending: pending.length,
        approved: approved.length,
        rejected: rejected.length,
      });
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleViewExpense = async (expenseId) => {
    try {
      const response = await apiService.expenses.getById(expenseId);
      setSelectedExpense(response.data.data);
      setShowDetailModal(true);
      setApprovalComment('');
    } catch (error) {
      console.error('Failed to fetch expense details:', error);
      toast.error('Failed to load expense details');
    }
  };

  const handleApprovalAction = async (action) => {
    if (!selectedExpense) return;

    try {
      await apiService.expenses.updateStatus(selectedExpense.expenseId, {
        status: action,
        comments: approvalComment,
      });

      toast.success(`Expense ${action.toLowerCase()} successfully`);
      setShowDetailModal(false);
      setSelectedExpense(null);
      setApprovalComment('');
      fetchExpenses();
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

  const getFilterButtonClass = (filterValue) => {
    return filter === filterValue
      ? 'px-4 py-2 bg-primary-600 text-white rounded-lg'
      : 'px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200';
  };

  const detailModal = (
    <>
      {showDetailModal && selectedExpense && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Expense Approval - {selectedExpense.expenseId}
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedExpense(null);
                  setApprovalComment('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Expense Details */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-gray-900">{selectedExpense.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span className={getStatusBadgeClass(selectedExpense.status)}>
                    {selectedExpense.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedExpense.currency} {parseFloat(selectedExpense.amount).toLocaleString()}
                  </p>
                  {selectedExpense.currency !== company?.defaultCurrency && (
                    <p className="text-xs text-gray-500">
                      {company?.defaultCurrency} {parseFloat(selectedExpense.amountInDefaultCurrency || 0).toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <p className="text-sm text-gray-900">{selectedExpense.category}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Submitted By
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-xs">
                        {selectedExpense.submittedBy?.firstName[0]}{selectedExpense.submittedBy?.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        {selectedExpense.submittedBy?.firstName} {selectedExpense.submittedBy?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedExpense.submittedBy?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Submission Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedExpense.submissionDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expense Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedExpense.expenseDate).toLocaleDateString()}
                  </p>
                </div>

                {selectedExpense.merchant && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Merchant
                    </label>
                    <p className="text-sm text-gray-900">{selectedExpense.merchant}</p>
                  </div>
                )}
              </div>

              {selectedExpense.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Notes
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {selectedExpense.notes}
                  </p>
                </div>
              )}

              {/* Receipts */}
              {selectedExpense.receipts && selectedExpense.receipts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipts
                  </label>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {selectedExpense.receipts.map((receipt, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-2">
                        <img
                          src={receipt.fileUrl}
                          alt={`Receipt ${index + 1}`}
                          className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-80"
                          onClick={() => window.open(receipt.fileUrl, '_blank')}
                        />
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {receipt.fileName}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval Action */}
              {selectedExpense.status === 'PENDING' && (
                <div className="border-t border-gray-200 pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval Comments
                  </label>
                  <textarea
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    className="input-field"
                    rows="3"
                    placeholder="Add comments for your approval decision..."
                  />
                </div>
              )}

              {/* Approval History */}
              {selectedExpense.approvals && selectedExpense.approvals.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approval History
                  </label>
                  <div className="space-y-3">
                    {selectedExpense.approvals.map((approval, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary-600 font-medium text-xs">
                            {approval.approver?.firstName[0]}{approval.approver?.lastName[0]}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {approval.approver?.firstName} {approval.approver?.lastName}
                            </p>
                            <span className={getStatusBadgeClass(approval.status)}>
                              {approval.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {approval.approver?.role} • {new Date(approval.createdAt).toLocaleDateString()}
                          </p>
                          {approval.comments && (
                            <p className="text-sm text-gray-700 mt-1">
                              {approval.comments}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              {selectedExpense.status === 'PENDING' ? (
                <>
                  <button
                    onClick={() => handleApprovalAction('REJECTED')}
                    className="btn-danger flex items-center space-x-2"
                  >
                    <XCircleIcon className="h-5 w-5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleApprovalAction('APPROVED')}
                    className="btn-success flex items-center space-x-2"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Approve</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedExpense(null);
                    setApprovalComment('');
                  }}
                  className="btn-secondary"
                >
                  Close
                </button>
              )}
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approval Center</h1>
        <p className="text-gray-600">Review and manage expense approvals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Approval</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.pending}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
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
              <XCircleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.rejected}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('PENDING')}
          className={getFilterButtonClass('PENDING')}
        >
          Pending ({stats.pending})
        </button>
        <button
          onClick={() => setFilter('APPROVED')}
          className={getFilterButtonClass('APPROVED')}
        >
          Approved ({stats.approved})
        </button>
        <button
          onClick={() => setFilter('REJECTED')}
          className={getFilterButtonClass('REJECTED')}
        >
          Rejected ({stats.rejected})
        </button>
      </div>

      {/* Expenses List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {filter === 'PENDING' ? 'Pending Approvals' : `${filter} Expenses`} ({expenses.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {expenses.length > 0 ? (
            expenses.map((expense) => (
              <div key={expense.expenseId} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {expense.submittedBy?.firstName[0]}{expense.submittedBy?.lastName[0]}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-lg font-medium text-gray-900">
                          {expense.description}
                        </h4>
                        <span className={getStatusBadgeClass(expense.status)}>
                          {expense.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          <span>
                            {expense.submittedBy?.firstName} {expense.submittedBy?.lastName}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>
                            {new Date(expense.submissionDate).toLocaleDateString()}
                          </span>
                        </div>
                        <span>{expense.category}</span>
                        {expense.merchant && <span>• {expense.merchant}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-lg font-medium text-gray-900">
                        {company?.defaultCurrency} {parseFloat(expense.amountInDefaultCurrency || 0).toLocaleString()}
                      </p>
                      {expense.currency !== company?.defaultCurrency && (
                        <p className="text-sm text-gray-500">
                          {expense.currency} {parseFloat(expense.amount).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewExpense(expense.expenseId)}
                        className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {expense.status === 'PENDING' && (
                        <>
                          <button
                            onClick={async () => {
                              try {
                                await apiService.expenses.updateStatus(expense.expenseId, {
                                  status: 'APPROVED',
                                  comments: 'Quick approval',
                                });
                                toast.success('Expense approved successfully');
                                fetchExpenses();
                              } catch (error) {
                                console.error('Failed to approve expense:', error);
                                toast.error('Failed to approve expense');
                              }
                            }}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await apiService.expenses.updateStatus(expense.expenseId, {
                                  status: 'REJECTED',
                                  comments: 'Quick rejection',
                                });
                                toast.success('Expense rejected successfully');
                                fetchExpenses();
                              } catch (error) {
                                console.error('Failed to reject expense:', error);
                                toast.error('Failed to reject expense');
                              }
                            }}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                          >
                            <XCircleIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {filter.toLowerCase()} expenses
              </h3>
              <p className="text-gray-500">
                {filter === 'PENDING' 
                  ? 'All caught up! No expenses waiting for your approval.'
                  : `No ${filter.toLowerCase()} expenses found.`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {detailModal}
    </div>
  );
};

export default ApprovalCenter;