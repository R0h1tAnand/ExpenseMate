import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DocumentTextIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const NewExpense = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/dashboard/employee/expenses')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Expense</h1>
          <p className="text-gray-600">Submit a new expense for approval</p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="card p-8 text-center">
        <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">
          Expense Creation Form
        </h3>
        <p className="text-gray-500 mb-6">
          This is a placeholder for the expense creation form. The complete implementation
          would include form fields for expense details, receipt upload, and submission.
        </p>
        <div className="space-y-4 max-w-md mx-auto">
          <div className="text-left">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              placeholder="Enter expense description"
              className="input-field"
              disabled
            />
          </div>
          <div className="text-left">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              placeholder="0.00"
              className="input-field"
              disabled
            />
          </div>
          <div className="text-left">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select className="input-field" disabled>
              <option>Select category</option>
            </select>
          </div>
          <button className="btn-primary w-full" disabled>
            Create Expense (Placeholder)
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewExpense;