import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import {
  UserIcon,
  PencilIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [formData, setFormData] = useState({
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
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await apiService.auth.updateProfile(formData);
      
      updateUser(response.data.data);
      toast.success('Profile updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      await apiService.auth.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      toast.success('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordSection(false);
    } catch (error) {
      console.error('Failed to update password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
    });
    setEditing(false);
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

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your personal information and account settings</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PencilIcon className="h-5 w-5" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Profile Information */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <UserIcon className="h-6 w-6 mr-2" />
            Personal Information
          </h3>
        </div>

        {editing ? (
          <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="input-field"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="input-field"
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="input-field"
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6">
            {/* Profile Header */}
            <div className="flex items-center space-x-6 mb-6">
              <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-bold text-2xl">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeClass(user.role)}`}>
                  {user.role}
                </span>
                {user.department && (
                  <p className="text-gray-600 mt-1 flex items-center">
                    <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                    {user.department.name}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
              </div>

              {user.phoneNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">{user.phoneNumber}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member Since
                </label>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {user.manager && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Manager
                  </label>
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">
                      {user.manager.firstName} {user.manager.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Password Section */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Password & Security</h3>
            <button
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="btn-secondary"
            >
              {showPasswordSection ? 'Cancel' : 'Change Password'}
            </button>
          </div>
        </div>

        {showPasswordSection && (
          <form onSubmit={handlePasswordUpdate} className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="input-field pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.current ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    required
                    minLength="6"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="input-field pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.new ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="input-field pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.confirm ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordSection(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  });
                }}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        )}

        {!showPasswordSection && (
          <div className="p-6">
            <p className="text-sm text-gray-600">
              Last password change: {new Date(user.updatedAt).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;