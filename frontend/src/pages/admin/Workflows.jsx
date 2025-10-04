import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import {
  Cog6ToothIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const WorkflowManagement = () => {
  const { company } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minAmount: '',
    maxAmount: '',
    departmentId: '',
    approvalSteps: [
      {
        stepOrder: 1,
        approverId: '',
        isRequired: true,
        description: '',
      }
    ],
  });

  useEffect(() => {
    fetchWorkflows();
    fetchDepartments();
    fetchUsers();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await apiService.workflows.getAll();
      setWorkflows(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await apiService.departments.getAll();
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiService.users.getAll();
      const allUsers = response.data.data;
      setUsers(allUsers.filter(user => user.role === 'MANAGER' || user.role === 'ADMIN'));
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const workflowData = {
        ...formData,
        minAmount: parseFloat(formData.minAmount) || 0,
        maxAmount: parseFloat(formData.maxAmount) || null,
        departmentId: formData.departmentId || null,
        approvalSteps: formData.approvalSteps.map(step => ({
          ...step,
          stepOrder: parseInt(step.stepOrder),
        })),
      };

      if (editingWorkflow) {
        await apiService.workflows.update(editingWorkflow.workflowId, workflowData);
        toast.success('Workflow updated successfully');
      } else {
        await apiService.workflows.create(workflowData);
        toast.success('Workflow created successfully');
      }

      setShowCreateModal(false);
      setEditingWorkflow(null);
      resetForm();
      fetchWorkflows();
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast.error(error.response?.data?.message || 'Failed to save workflow');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      minAmount: '',
      maxAmount: '',
      departmentId: '',
      approvalSteps: [
        {
          stepOrder: 1,
          approverId: '',
          isRequired: true,
          description: '',
        }
      ],
    });
  };

  const handleEdit = (workflow) => {
    setEditingWorkflow(workflow);
    setFormData({
      name: workflow.name,
      description: workflow.description || '',
      minAmount: workflow.minAmount || '',
      maxAmount: workflow.maxAmount || '',
      departmentId: workflow.departmentId || '',
      approvalSteps: workflow.approvalSteps?.length > 0 ? workflow.approvalSteps : [
        {
          stepOrder: 1,
          approverId: '',
          isRequired: true,
          description: '',
        }
      ],
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (workflowId) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) {
      return;
    }

    try {
      await apiService.workflows.delete(workflowId);
      toast.success('Workflow deleted successfully');
      fetchWorkflows();
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      toast.error(error.response?.data?.message || 'Failed to delete workflow');
    }
  };

  const addApprovalStep = () => {
    setFormData({
      ...formData,
      approvalSteps: [
        ...formData.approvalSteps,
        {
          stepOrder: formData.approvalSteps.length + 1,
          approverId: '',
          isRequired: true,
          description: '',
        }
      ],
    });
  };

  const removeApprovalStep = (index) => {
    if (formData.approvalSteps.length > 1) {
      const newSteps = formData.approvalSteps.filter((_, i) => i !== index);
      // Reorder steps
      const reorderedSteps = newSteps.map((step, i) => ({
        ...step,
        stepOrder: i + 1,
      }));
      setFormData({
        ...formData,
        approvalSteps: reorderedSteps,
      });
    }
  };

  const updateApprovalStep = (index, field, value) => {
    const newSteps = [...formData.approvalSteps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      approvalSteps: newSteps,
    });
  };

  const modal = (
    <>
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingWorkflow(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter workflow name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="input-field"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept.departmentId} value={dept.departmentId}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Amount ({company?.defaultCurrency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minAmount}
                    onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                    className="input-field"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Amount ({company?.defaultCurrency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maxAmount}
                    onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                    className="input-field"
                    placeholder="No limit"
                  />
                </div>
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
                  placeholder="Enter workflow description"
                />
              </div>

              {/* Approval Steps */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium text-gray-900">Approval Steps</h4>
                  <button
                    type="button"
                    onClick={addApprovalStep}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Step</span>
                  </button>
                </div>

                {formData.approvalSteps.map((step, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h5 className="text-md font-medium text-gray-800">Step {step.stepOrder}</h5>
                      {formData.approvalSteps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeApprovalStep(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Approver *
                        </label>
                        <select
                          required
                          value={step.approverId}
                          onChange={(e) => updateApprovalStep(index, 'approverId', e.target.value)}
                          className="input-field"
                        >
                          <option value="">Select an approver</option>
                          {users.map((user) => (
                            <option key={user.userId} value={user.userId}>
                              {user.firstName} {user.lastName} ({user.role})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={step.isRequired}
                          onChange={(e) => updateApprovalStep(index, 'isRequired', e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          Required approval
                        </label>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Step Description
                        </label>
                        <input
                          type="text"
                          value={step.description}
                          onChange={(e) => updateApprovalStep(index, 'description', e.target.value)}
                          className="input-field"
                          placeholder="Enter step description"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingWorkflow(null);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingWorkflow ? 'Update Workflow' : 'Create Workflow'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Workflow Management</h1>
          <p className="text-gray-600">Configure approval workflows for expense processing</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Create Workflow</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Cog6ToothIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Workflows</dt>
                <dd className="text-lg font-medium text-gray-900">{workflows.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BuildingOfficeIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Departments</dt>
                <dd className="text-lg font-medium text-gray-900">{departments.length}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Approvers</dt>
                <dd className="text-lg font-medium text-gray-900">{users.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Workflows List */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Configured Workflows</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {workflows.length > 0 ? (
            workflows.map((workflow) => (
              <div key={workflow.workflowId} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      {workflow.name}
                    </h4>
                    {workflow.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {workflow.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                        <span>
                          {workflow.minAmount ? `${company?.defaultCurrency} ${workflow.minAmount}` : 'No minimum'}
                          {' - '}
                          {workflow.maxAmount ? `${company?.defaultCurrency} ${workflow.maxAmount}` : 'No maximum'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                        <span>
                          {workflow.department?.name || 'All Departments'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        <span>
                          {workflow.approvalSteps?.length || 0} approval step(s)
                        </span>
                      </div>
                    </div>

                    {/* Approval Steps */}
                    {workflow.approvalSteps && workflow.approvalSteps.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Approval Steps:</h5>
                        <div className="space-y-2">
                          {workflow.approvalSteps.map((step, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                              <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                                {step.stepOrder}
                              </span>
                              <div className="flex-1">
                                <span className="font-medium">
                                  {step.approver?.firstName} {step.approver?.lastName}
                                </span>
                                <span className="text-gray-500 ml-2">
                                  ({step.approver?.role})
                                </span>
                                {step.description && (
                                  <span className="text-gray-500 ml-2">
                                    - {step.description}
                                  </span>
                                )}
                                {step.isRequired && (
                                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                                    Required
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(workflow)}
                      className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-50 rounded-lg"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(workflow.workflowId)}
                      className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <Cog6ToothIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows configured</h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first approval workflow.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Workflow
              </button>
            </div>
          )}
        </div>
      </div>

      {modal}
    </div>
  );
};

export default WorkflowManagement;