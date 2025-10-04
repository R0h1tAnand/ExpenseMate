const { ApprovalWorkflow, Company } = require('../models');
const { sendSuccess, sendCreated, sendError, sendNotFound } = require('../utils/response');

/**
 * Get all approval workflows for company
 */
const getWorkflows = async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const whereClause = { companyId: req.user.companyId };
    
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const workflows = await ApprovalWorkflow.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });

    return sendSuccess(res, 'Workflows retrieved successfully', workflows);
  } catch (error) {
    console.error('Get workflows error:', error);
    return sendError(res, 500, 'Failed to retrieve workflows');
  }
};

/**
 * Get workflow by ID
 */
const getWorkflowById = async (req, res) => {
  try {
    const { id } = req.params;

    const workflow = await ApprovalWorkflow.findOne({
      where: { 
        workflowId: id,
        companyId: req.user.companyId
      }
    });

    if (!workflow) {
      return sendNotFound(res, 'Workflow not found');
    }

    return sendSuccess(res, 'Workflow retrieved successfully', workflow);
  } catch (error) {
    console.error('Get workflow error:', error);
    return sendError(res, 500, 'Failed to retrieve workflow');
  }
};

/**
 * Create new approval workflow (Admin only)
 */
const createWorkflow = async (req, res) => {
  try {
    const { name, description, rules } = req.body;

    // Validate rules structure
    const validationError = validateWorkflowRules(rules);
    if (validationError) {
      return sendError(res, 400, validationError);
    }

    const workflow = await ApprovalWorkflow.create({
      name,
      description,
      companyId: req.user.companyId,
      rules,
      isActive: true
    });

    return sendCreated(res, 'Workflow created successfully', {
      workflowId: workflow.workflowId,
      name: workflow.name,
      description: workflow.description,
      rules: workflow.rules,
      isActive: workflow.isActive,
      createdAt: workflow.createdAt
    });
  } catch (error) {
    console.error('Create workflow error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 400, 'Workflow name already exists');
    }
    
    return sendError(res, 500, 'Failed to create workflow');
  }
};

/**
 * Update approval workflow (Admin only)
 */
const updateWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, rules, isActive } = req.body;

    const workflow = await ApprovalWorkflow.findOne({
      where: { 
        workflowId: id,
        companyId: req.user.companyId
      }
    });

    if (!workflow) {
      return sendNotFound(res, 'Workflow not found');
    }

    // Validate rules if provided
    if (rules) {
      const validationError = validateWorkflowRules(rules);
      if (validationError) {
        return sendError(res, 400, validationError);
      }
    }

    await workflow.update({
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(rules && { rules }),
      ...(isActive !== undefined && { isActive })
    });

    return sendSuccess(res, 'Workflow updated successfully', {
      workflowId: workflow.workflowId,
      name: workflow.name,
      description: workflow.description,
      rules: workflow.rules,
      isActive: workflow.isActive,
      updatedAt: workflow.updatedAt
    });
  } catch (error) {
    console.error('Update workflow error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return sendError(res, 400, 'Workflow name already exists');
    }
    
    return sendError(res, 500, 'Failed to update workflow');
  }
};

/**
 * Delete approval workflow (Admin only)
 */
const deleteWorkflow = async (req, res) => {
  try {
    const { id } = req.params;

    const workflow = await ApprovalWorkflow.findOne({
      where: { 
        workflowId: id,
        companyId: req.user.companyId
      }
    });

    if (!workflow) {
      return sendNotFound(res, 'Workflow not found');
    }

    // Check if workflow is being used by any expenses
    const { Expense } = require('../models');
    const expensesUsingWorkflow = await Expense.count({
      where: { 
        approvalWorkflowId: id,
        status: ['PENDING', 'APPROVED']
      }
    });

    if (expensesUsingWorkflow > 0) {
      return sendError(res, 400, 'Cannot delete workflow that is being used by active expenses');
    }

    await workflow.destroy();

    return sendSuccess(res, 'Workflow deleted successfully');
  } catch (error) {
    console.error('Delete workflow error:', error);
    return sendError(res, 500, 'Failed to delete workflow');
  }
};

/**
 * Get workflow templates/examples
 */
const getWorkflowTemplates = async (req, res) => {
  try {
    const templates = [
      {
        name: 'Sequential Approval',
        description: 'Manager → Finance → Director approval sequence',
        rules: {
          type: 'sequential',
          steps: ['manager-user-id', 'finance-user-id', 'director-user-id'],
          conditions: {}
        }
      },
      {
        name: 'Percentage Based',
        description: '60% of approvers must approve',
        rules: {
          type: 'percentage',
          thresholdPercentage: 60,
          steps: ['approver1-id', 'approver2-id', 'approver3-id'],
          conditions: {}
        }
      },
      {
        name: 'CFO Required',
        description: 'CFO approval required for all expenses',
        rules: {
          type: 'specific',
          requiredApprovers: ['cfo-user-id'],
          steps: ['manager-id', 'cfo-user-id'],
          conditions: {}
        }
      },
      {
        name: 'Amount Based Hybrid',
        description: 'Different approval flow based on expense amount',
        rules: {
          type: 'hybrid',
          conditions: {
            amount_threshold: 1000,
            high_amount_approvers: ['cfo-user-id', 'ceo-user-id'],
            normal_approvers: ['manager-user-id'],
            high_amount_percentage: 100,
            normal_amount_percentage: 100
          }
        }
      }
    ];

    return sendSuccess(res, 'Workflow templates retrieved successfully', templates);
  } catch (error) {
    console.error('Get workflow templates error:', error);
    return sendError(res, 500, 'Failed to retrieve workflow templates');
  }
};

/**
 * Validate workflow rules structure
 */
const validateWorkflowRules = (rules) => {
  if (!rules || typeof rules !== 'object') {
    return 'Rules must be a valid object';
  }

  const validTypes = ['sequential', 'percentage', 'specific', 'hybrid'];
  if (!validTypes.includes(rules.type)) {
    return 'Rules type must be one of: sequential, percentage, specific, hybrid';
  }

  switch (rules.type) {
    case 'sequential':
      if (!rules.steps || !Array.isArray(rules.steps) || rules.steps.length === 0) {
        return 'Sequential rules must have at least one step';
      }
      break;

    case 'percentage':
      if (!rules.thresholdPercentage || rules.thresholdPercentage < 0 || rules.thresholdPercentage > 100) {
        return 'Threshold percentage must be between 0 and 100';
      }
      if (!rules.steps || !Array.isArray(rules.steps) || rules.steps.length === 0) {
        return 'Percentage rules must have at least one approver';
      }
      break;

    case 'specific':
      if (!rules.requiredApprovers || !Array.isArray(rules.requiredApprovers) || rules.requiredApprovers.length === 0) {
        return 'Specific rules must have at least one required approver';
      }
      break;

    case 'hybrid':
      if (!rules.conditions || typeof rules.conditions !== 'object') {
        return 'Hybrid rules must have conditions object';
      }
      break;
  }

  return null; // No validation errors
};

module.exports = {
  getWorkflows,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  getWorkflowTemplates
};