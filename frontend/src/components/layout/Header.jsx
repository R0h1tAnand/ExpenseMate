import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { BellIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const { user, company } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Company info */}
          <div className="flex items-center">
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-gray-900">
                {company?.name}
              </h1>
              <p className="text-sm text-gray-500">
                Default Currency: {company?.defaultCurrency}
              </p>
            </div>
          </div>

          {/* Right side - Search and notifications */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search expenses..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Notifications */}
            <button
              type="button"
              className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <BellIcon className="h-6 w-6" />
            </button>

            {/* User profile */}
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role}
                </p>
              </div>
              <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;