import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import toast from 'react-hot-toast';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [currencies, setCurrencies] = useState([]);
  const [loadingCurrencies, setLoadingCurrencies] = useState(true);
  const { signup, isLoading, error, clearError } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  // Fetch available currencies
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        console.log('Fetching currencies...');
        const response = await apiService.companies.getCurrencies();
        console.log('Currencies response:', response);
        setCurrencies(response.data.data);
      } catch (error) {
        console.error('Failed to fetch currencies:', error);
        // Fallback currencies if API fails
        setCurrencies(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY']);
        toast.error('Failed to load currencies, using defaults');
      } finally {
        setLoadingCurrencies(false);
      }
    };

    fetchCurrencies();
  }, []);

  const onSubmit = async (data) => {
    clearError();
    const result = await signup(data);
    
    if (result.success) {
      toast.success('Company created successfully! Welcome to Expense Management System.');
    } else {
      toast.error(result.error);
    }
  };

  // Show loading state while currencies are being fetched
  if (loadingCurrencies) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading signup form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">EM</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your company account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set up your expense management system and become the administrator
          </p>
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              You will be the Admin
            </span>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Company Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Company Information</h3>
              <p className="text-sm text-gray-600 mb-4">
                Create your company account and become the administrator
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    {...register('companyName', {
                      required: 'Company name is required',
                      minLength: {
                        value: 2,
                        message: 'Company name must be at least 2 characters',
                      },
                      maxLength: {
                        value: 100,
                        message: 'Company name must not exceed 100 characters',
                      },
                    })}
                    type="text"
                    className={`input mt-1 ${errors.companyName ? 'border-red-500' : ''}`}
                    placeholder="Enter your company name"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700">
                    Default Currency
                  </label>
                  <select
                    {...register('defaultCurrency', {
                      required: 'Please select a default currency',
                    })}
                    className={`input mt-1 ${errors.defaultCurrency ? 'border-red-500' : ''}`}
                    disabled={loadingCurrencies}
                  >
                    <option value="">
                      {loadingCurrencies ? 'Loading currencies...' : 'Select currency'}
                    </option>
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                  {errors.defaultCurrency && (
                    <p className="mt-1 text-sm text-red-600">{errors.defaultCurrency.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Account Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Account</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      {...register('firstName', {
                        required: 'First name is required',
                        minLength: {
                          value: 2,
                          message: 'First name must be at least 2 characters',
                        },
                        maxLength: {
                          value: 50,
                          message: 'First name must not exceed 50 characters',
                        },
                      })}
                      type="text"
                      className={`input mt-1 ${errors.firstName ? 'border-red-500' : ''}`}
                      placeholder="First name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      {...register('lastName', {
                        required: 'Last name is required',
                        minLength: {
                          value: 2,
                          message: 'Last name must be at least 2 characters',
                        },
                        maxLength: {
                          value: 50,
                          message: 'Last name must not exceed 50 characters',
                        },
                      })}
                      type="text"
                      className={`input mt-1 ${errors.lastName ? 'border-red-500' : ''}`}
                      placeholder="Last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    autoComplete="email"
                    className={`input mt-1 ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Enter admin email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      className={`input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || loadingCurrencies}
              className="btn-primary w-full relative"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </>
              ) : (
                'Create Company Account'
              )}
            </button>
          </div>

          <div className="text-center space-y-3">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in here
              </Link>
            </span>
            <div className="pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                Want a different role?{' '}
                <Link
                  to="/auth-selection"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Choose your signup type
                </Link>
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;