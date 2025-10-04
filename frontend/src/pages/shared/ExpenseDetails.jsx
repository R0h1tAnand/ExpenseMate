import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ExpenseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>
      </div>
      
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Expense Details
        </h1>
        
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            Expense ID: {id}
          </p>
          <p className="text-gray-600">
            Expense details component is under development.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetails;