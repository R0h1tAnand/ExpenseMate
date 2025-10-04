import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../config/constants';
import {
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  Bars3Icon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, isAdmin, isManager, isEmployee } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: getDashboardPath(),
        icon: HomeIcon,
        current: location.pathname === getDashboardPath(),
      },
    ];

    if (isAdmin()) {
      return [
        ...baseItems,
        {
          name: 'Users',
          href: '/admin/users',
          icon: UsersIcon,
          current: location.pathname.startsWith('/admin/users'),
        },
        {
          name: 'Workflows',
          href: '/admin/workflows',
          icon: Cog6ToothIcon,
          current: location.pathname.startsWith('/admin/workflows'),
        },
        {
          name: 'Company',
          href: '/admin/company',
          icon: BuildingOfficeIcon,
          current: location.pathname.startsWith('/admin/company'),
        },
        {
          name: 'All Expenses',
          href: '/admin/expenses',
          icon: CurrencyDollarIcon,
          current: location.pathname.startsWith('/admin/expenses'),
        },
      ];
    }

    if (isManager()) {
      return [
        ...baseItems,
        {
          name: 'My Expenses',
          href: '/manager/expenses',
          icon: CurrencyDollarIcon,
          current: location.pathname.startsWith('/manager/expenses'),
        },
        {
          name: 'Pending Approvals',
          href: '/manager/approvals',
          icon: ClockIcon,
          current: location.pathname.startsWith('/manager/approvals'),
        },
        {
          name: 'Team',
          href: '/manager/team',
          icon: UsersIcon,
          current: location.pathname.startsWith('/manager/team'),
        },
      ];
    }

    if (isEmployee()) {
      return [
        ...baseItems,
        {
          name: 'My Expenses',
          href: '/employee/expenses',
          icon: CurrencyDollarIcon,
          current: location.pathname.startsWith('/employee/expenses'),
        },
        {
          name: 'Submit Expense',
          href: '/employee/submit',
          icon: CheckCircleIcon,
          current: location.pathname === '/employee/submit',
        },
      ];
    }

    return baseItems;
  };

  const getDashboardPath = () => {
    if (isAdmin()) return '/admin';
    if (isManager()) return '/manager';
    if (isEmployee()) return '/employee';
    return '/employee';
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 z-40 flex items-center justify-between w-full h-16 px-4 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="ml-4 flex items-center">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EM</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">
                Expense Manager
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="fixed top-0 left-0 z-50 w-64 h-full bg-white">
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EM</span>
                </div>
                <span className="ml-2 text-lg font-semibold text-gray-900">
                  Expense Manager
                </span>
              </div>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <SidebarContent 
              navigationItems={navigationItems}
              user={user}
              onLogout={handleLogout}
              onLinkClick={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EM</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">
                Expense Manager
              </span>
            </div>
          </div>
          
          <SidebarContent 
            navigationItems={navigationItems}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      </div>
    </>
  );
};

// Sidebar content component
const SidebarContent = ({ navigationItems, user, onLogout, onLinkClick }) => {
  return (
    <div className="flex flex-col flex-grow">
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onLinkClick}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                ${item.current
                  ? 'bg-primary-100 text-primary-900 border-r-2 border-primary-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon
                className={`
                  mr-3 flex-shrink-0 h-6 w-6
                  ${item.current ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'}
                `}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User info and logout */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">
              {user?.role}
            </p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="mt-3 w-full text-left px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;