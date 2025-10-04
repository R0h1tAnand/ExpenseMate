import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import {
  BuildingOfficeIcon,
  PencilIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CompanySettings = () => {
  const { company, updateCompany } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    defaultCurrency: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const currencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL'
  ];

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        defaultCurrency: company.defaultCurrency || '',
        description: company.description || '',
      });
    }
  }, [company]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await apiService.company.update(company.companyId, formData);
      
      // Update context with new company data
      updateCompany(response.data.data);
      
      toast.success('Company settings updated successfully');
      setEditing(false);
    } catch (error) {
      console.error('Failed to update company settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update company settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (company) {
      setFormData({
        name: company.name || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        defaultCurrency: company.defaultCurrency || '',
        description: company.description || '',
      });
    }
    setEditing(false);
  };

  if (!company) {
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
          <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
          <p className="text-gray-600">Manage your company information and preferences</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PencilIcon className="h-5 w-5" />
            <span>Edit Settings</span>
          </button>
        )}
      </div>

      {/* Company Information Card */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <BuildingOfficeIcon className="h-6 w-6 mr-2" />
            Company Information
          </h3>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Currency *
                </label>
                <select
                  required
                  value={formData.defaultCurrency}
                  onChange={(e) => setFormData({ ...formData, defaultCurrency: e.target.value })}
                  className="input-field"
                >
                  <option value="">Select currency</option>
                  {currencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field"
                  placeholder="Enter company email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field"
                  placeholder="Enter company phone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="input-field"
                  placeholder="Enter company website"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Enter company address"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Enter company description"
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
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <p className="text-sm text-gray-900">{company.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Currency
                </label>
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
                  <p className="text-sm text-gray-900">{company.defaultCurrency}</p>
                </div>
              </div>

              {company.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="flex items-center">
                    <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">{company.email}</p>
                  </div>
                </div>
              )}

              {company.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-900">{company.phone}</p>
                  </div>
                </div>
              )}

              {company.website && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <div className="flex items-center">
                    <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      {company.website}
                    </a>
                  </div>
                </div>
              )}

              {company.address && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <div className="flex items-start">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <p className="text-sm text-gray-900">{company.address}</p>
                  </div>
                </div>
              )}

              {company.description && (
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-sm text-gray-900">{company.description}</p>
                </div>
              )}
            </div>

            {/* Company Stats */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Company Overview</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">
                    {company.createdAt ? new Date(company.createdAt).getFullYear() : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-500">Year Established</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">
                    {company.defaultCurrency}
                  </div>
                  <div className="text-sm text-gray-500">Primary Currency</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">
                    Active
                  </div>
                  <div className="text-sm text-gray-500">Status</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanySettings;