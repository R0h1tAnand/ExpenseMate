import React, { useState } from 'react';
import { apiService } from '../services/api';

const ConnectionTest = () => {
  const [status, setStatus] = useState('Not tested');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      // Test the health endpoint
      const response = await fetch('http://localhost:5000/health');
      if (response.ok) {
        const data = await response.json();
        setStatus(`✅ Backend connected successfully! Server: ${data.message}`);
      } else {
        setStatus(`❌ Backend responded with status: ${response.status}`);
      }
    } catch (error) {
      setStatus(`❌ Connection failed: ${error.message}`);
    }
    setLoading(false);
  };

  const testCurrencies = async () => {
    setLoading(true);
    try {
      const response = await apiService.companies.getCurrencies();
      setStatus(`✅ API call successful! Retrieved ${response.data.data.length} currencies`);
    } catch (error) {
      setStatus(`❌ API call failed: ${error.response?.data?.message || error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 border max-w-sm">
      <h3 className="font-bold text-sm mb-2">Backend Connection Test</h3>
      <p className="text-xs mb-3 text-gray-600">{status}</p>
      <div className="space-y-2">
        <button
          onClick={testConnection}
          disabled={loading}
          className="w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Health Endpoint'}
        </button>
        <button
          onClick={testCurrencies}
          disabled={loading}
          className="w-full px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Call'}
        </button>
      </div>
    </div>
  );
};

export default ConnectionTest;