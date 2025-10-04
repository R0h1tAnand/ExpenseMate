import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';
import {
  DocumentTextIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  TagIcon,
  PhotoIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const NewExpense = () => {
  const navigate = useNavigate();
  const { user, company } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    category: 'OTHER',
    originalAmount: '',
    originalCurrency: company?.defaultCurrency || 'USD',
    expenseDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    notes: '',
    receiptFile: null,
  });
  const [errors, setErrors] = useState({});

  // Expense categories from backend model
  const categories = [
    { value: 'TRAVEL', label: 'Travel' },
    { value: 'ACCOMMODATION', label: 'Accommodation' },
    { value: 'MEALS', label: 'Meals & Entertainment' },
    { value: 'TRANSPORTATION', label: 'Transportation' },
    { value: 'OFFICE_SUPPLIES', label: 'Office Supplies' },
    { value: 'EQUIPMENT', label: 'Equipment' },
    { value: 'SOFTWARE', label: 'Software' },
    { value: 'TRAINING', label: 'Training & Development' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'ENTERTAINMENT', label: 'Entertainment' },
    { value: 'OTHER', label: 'Other' },
  ];

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    if (company?.defaultCurrency) {
      setFormData(prev => ({
        ...prev,
        originalCurrency: company.defaultCurrency
      }));
    }
  }, [company]);

  const fetchCurrencies = async () => {
    try {
      const response = await apiService.companies.getCurrencies();
      setCurrencies(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch currencies:', error);
      // Fallback to common currencies
      setCurrencies(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR']);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, GIF) or PDF file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        receiptFile: file
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.originalAmount || parseFloat(formData.originalAmount) <= 0) {
      newErrors.originalAmount = 'Please enter a valid amount greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.expenseDate) {
      newErrors.expenseDate = 'Expense date is required';
    } else {
      const expenseDate = new Date(formData.expenseDate);
      const today = new Date();
      const daysDiff = Math.ceil((today - expenseDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 30) {
        newErrors.expenseDate = 'Expense date cannot be more than 30 days old';
      }
      
      if (expenseDate > today) {
        newErrors.expenseDate = 'Expense date cannot be in the future';
      }
    }

    if (!formData.originalCurrency) {
      newErrors.originalCurrency = 'Please select a currency';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      // Create expense data
      const expenseData = {
        description: formData.description.trim(),
        category: formData.category,
        originalAmount: parseFloat(formData.originalAmount),
        originalCurrency: formData.originalCurrency,
        expenseDate: formData.expenseDate,
        notes: formData.notes.trim() || null,
      };

      // Create the expense
      const response = await apiService.expenses.create(expenseData);
      
      if (response.data.success) {
        toast.success('Expense created successfully!');
        navigate('/dashboard/expenses');
      } else {
        throw new Error(response.data.message || 'Failed to create expense');
      }
    } catch (error) {
      console.error('Create expense error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create expense';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!formData.description.trim()) {
      toast.error('Description is required to save as draft');
      return;
    }

    setLoading(true);

    try {
      const expenseData = {
        description: formData.description.trim(),
        category: formData.category,
        originalAmount: parseFloat(formData.originalAmount) || 0,
        originalCurrency: formData.originalCurrency,
        expenseDate: formData.expenseDate || new Date().toISOString().split('T')[0],
        notes: formData.notes.trim() || null,
        status: 'DRAFT'
      };

      const response = await apiService.expenses.create(expenseData);
      
      if (response.data.success) {
        toast.success('Expense saved as draft!');
        navigate('/dashboard/expenses');
      } else {
        throw new Error(response.data.message || 'Failed to save expense');
      }
    } catch (error) {
      console.error('Save draft error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save expense';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/dashboard/expenses')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Expenses
            </button>
          </div>
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg px-8 py-6 text-white shadow-lg">
            <h1 className="text-3xl font-bold mb-2">Create New Expense</h1>
            <p className="text-primary-100 text-lg">
              Submit your expense for approval with all required details
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-medium">
                  1
                </div>
                <span className="font-medium text-gray-900">Fill Details</span>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded">
                <div className="h-1 bg-primary-600 rounded w-1/3"></div>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center font-medium">
                  2
                </div>
                <span>Review & Submit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Card */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                  <DocumentTextIcon className="h-5 w-5 text-white" />
                </div>
                Basic Information
              </h3>
              <p className="text-gray-600 mt-1">Enter the essential details of your expense</p>
            </div>
            <div className="p-8 space-y-8">
              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-900">
                  Expense Description *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g., Business lunch with client, Conference travel, Office supplies"
                    className={`w-full px-4 py-3 border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                      errors.description 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-primary-500 bg-white hover:border-gray-300'
                    }`}
                    maxLength="255"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-sm text-gray-400">{formData.description.length}/255</span>
                  </div>
                </div>
                {errors.description && (
                  <div className="flex items-center mt-2 text-red-600">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                    <p className="text-sm font-medium">{errors.description}</p>
                  </div>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-semibold text-gray-900">
                  Expense Category *
                </label>
                <div className="relative">
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none ${
                      errors.category 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-primary-500 bg-white hover:border-gray-300'
                    }`}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <TagIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.category && (
                  <div className="flex items-center mt-2 text-red-600">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                    <p className="text-sm font-medium">{errors.category}</p>
                  </div>
                )}
              </div>

              {/* Amount and Currency */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="originalAmount" className="block text-sm font-semibold text-gray-900">
                    Amount *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="originalAmount"
                      name="originalAmount"
                      value={formData.originalAmount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                        errors.originalAmount 
                          ? 'border-red-300 focus:border-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-primary-500 bg-white hover:border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.originalAmount && (
                    <div className="flex items-center mt-2 text-red-600">
                      <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                      <p className="text-sm font-medium">{errors.originalAmount}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="originalCurrency" className="block text-sm font-semibold text-gray-900">
                    Currency *
                  </label>
                  <select
                    id="originalCurrency"
                    name="originalCurrency"
                    value={formData.originalCurrency}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none ${
                      errors.originalCurrency 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-primary-500 bg-white hover:border-gray-300'
                    }`}
                  >
                    {currencies.map(currency => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                  {errors.originalCurrency && (
                    <div className="flex items-center mt-2 text-red-600">
                      <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                      <p className="text-sm font-medium">{errors.originalCurrency}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Expense Date */}
              <div className="space-y-2">
                <label htmlFor="expenseDate" className="block text-sm font-semibold text-gray-900">
                  When was this expense incurred? *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="expenseDate"
                    name="expenseDate"
                    value={formData.expenseDate}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
                      errors.expenseDate 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-primary-500 bg-white hover:border-gray-300'
                    }`}
                  />
                </div>
                {errors.expenseDate && (
                  <div className="flex items-center mt-2 text-red-600">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                    <p className="text-sm font-medium">{errors.expenseDate}</p>
                  </div>
                )}
                <p className="text-sm text-gray-500 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Expenses must be submitted within 30 days
                </p>
              </div>
            </div>
          </div>

          {/* Additional Information Card */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                  <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Additional Details
              </h3>
              <p className="text-gray-600 mt-1">Add supporting information and documentation</p>
            </div>
            <div className="p-8 space-y-8">
              {/* Notes */}
              <div className="space-y-2">
                <label htmlFor="notes" className="block text-sm font-semibold text-gray-900">
                  Business Justification & Notes
                </label>
                <div className="relative">
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Explain the business purpose of this expense, who was involved, and any other relevant details..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-all hover:border-gray-300"
                    maxLength="500"
                  />
                  <div className="absolute bottom-3 right-3">
                    <span className="text-sm text-gray-400">{formData.notes.length}/500</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Providing detailed business justification helps speed up the approval process
                </p>
              </div>

              {/* Receipt Upload */}
              <div className="space-y-2">
                <label htmlFor="receiptFile" className="block text-sm font-semibold text-gray-900">
                  Receipt or Supporting Document
                </label>
                <div className="mt-2">
                  <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors group">
                    <input
                      id="receiptFile"
                      name="receiptFile"
                      type="file"
                      className="sr-only"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                    />
                    
                    {formData.receiptFile ? (
                      <div className="space-y-3">
                        <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-600">
                            ✓ {formData.receiptFile.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(formData.receiptFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, receiptFile: null }))}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                          <PhotoIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <label
                            htmlFor="receiptFile"
                            className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                          >
                            <PhotoIcon className="h-5 w-5 mr-2" />
                            Choose file
                          </label>
                          <p className="mt-2 text-sm text-gray-500">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF, PDF up to 5MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard/expenses')}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSaveAsDraft}
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Save as Draft
                </button>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg transition-all transform hover:scale-105"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Expense...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Create Expense
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewExpense;