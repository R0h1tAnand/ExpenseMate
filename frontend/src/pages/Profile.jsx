import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  KeyIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, company, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiService.users.updateProfile(profileData);
      await updateProfile(response.data.data);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await apiService.users.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800';
      case 'EMPLOYEE':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Information', icon: UserIcon },
    { id: 'security', name: 'Security', icon: KeyIcon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your personal information and security settings</p>
      </div>

      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-medium text-2xl">
                {user?.firstName[0]}{user?.lastName[0]}
              </span>
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:bg-gray-50"
            >
              <CameraIcon className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeClass(user?.role)}`}>
                {user?.role}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">{company?.name}</span>
            </div>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-1" />
                {user?.email}
              </div>
              {user?.phoneNumber && (
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  {user?.phoneNumber}
                </div>
              )}
              {user?.department && (
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                  {user?.department?.name}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="input-field"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="input-field"
                    placeholder="Enter your last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="input-field"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phoneNumber}
                    onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                    className="input-field"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Read-only fields */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role}
                    disabled
                    className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={company?.name}
                    disabled
                    className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>

                {user?.department && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={user?.department?.name}
                      disabled
                      className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                )}

                {user?.manager && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manager
                    </label>
                    <input
                      type="text"
                      value={`${user?.manager?.firstName} ${user?.manager?.lastName}`}
                      disabled
                      className="input-field bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="input-field"
                    placeholder="Enter your current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input-field"
                    placeholder="Enter your new password"
                    minLength="6"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="input-field"
                    placeholder="Confirm your new password"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>

              {/* Security Information */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Security Information</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Password Security Tips
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Use a strong, unique password for your account</li>
                          <li>Include a mix of letters, numbers, and special characters</li>
                          <li>Don't share your password with anyone</li>
                          <li>Change your password regularly</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Account Information */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Member since</dt>
            <dd className="text-sm text-gray-900">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last updated</dt>
            <dd className="text-sm text-gray-900">
              {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="text-sm text-gray-900 font-mono">{user?.userId}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Company ID</dt>
            <dd className="text-sm text-gray-900 font-mono">{company?.companyId}</dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;