import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const ExpenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/dashboard/expenses')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Details</h1>
          <p className="text-gray-600">View expense information and status</p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="card p-8 text-center">
        <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          Expense Detail View
        </h3>
        <p className="text-gray-500 mb-6">
          This is a placeholder for the expense detail view. Expense ID: <span className="font-mono">{id}</span>
        </p>
        <p className="text-gray-500">
          The complete implementation would show expense details, receipts, approval history,
          and allow editing if the expense is in draft or rejected status.
        </p>
      </div>
    </div>
  );
};

export default ExpenseDetail;