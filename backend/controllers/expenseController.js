const { Expense, User, ApprovalWorkflow, Company } = require('../models');
const { sendSuccess, sendCreated, sendError, sendNotFound, paginate } = require('../utils/response');
const { convertCurrency } = require('../utils/currency');
const { Op } = require('sequelize');

/**
 * Create new expense (Employee role)
 */
const createExpense = async (req, res) => {
  try {
    const { description, category, originalAmount, originalCurrency, expenseDate, notes } = req.body;

    // Get company default currency
    const user = await User.findByPk(req.user.userId, {
      include: [{ model: Company, as: 'company' }]
    });

    const defaultCurrency = user.company.defaultCurrency;

    // Convert currency if needed
    let amountInDefaultCurrency = originalAmount;
    let exchangeRate = 1;

    if (originalCurrency !== defaultCurrency) {
      const conversion = await convertCurrency(originalAmount, originalCurrency, defaultCurrency);
      amountInDefaultCurrency = conversion.convertedAmount;
      exchangeRate = conversion.exchangeRate;
    }

    const expense = await Expense.create({
      description,
      category,
      submissionDate: new Date(),
      originalAmount,
      originalCurrency,
      amountInDefaultCurrency,
      expenseDate: new Date(expenseDate),
      status: 'DRAFT',
      submittedById: req.user.userId,
      exchangeRate,
      notes
    });

    return sendCreated(res, 'Expense created successfully', {
      expenseId: expense.expenseId,
      description: expense.description,
      category: expense.category,
      originalAmount: expense.originalAmount,
      originalCurrency: expense.originalCurrency,
      amountInDefaultCurrency: expense.amountInDefaultCurrency,
      exchangeRate: expense.exchangeRate,
      status: expense.status,
      expenseDate: expense.expenseDate,
      createdAt: expense.createdAt
    });
  } catch (error) {
    console.error('Create expense error:', error);
    return sendError(res, 500, 'Failed to create expense');
  }
};

/**
 * Get expenses (filtered by user role)
 */
const getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, startDate, endDate } = req.query;
    
    // Build where clause based on user role
    let whereClause = {};
    let includeUser = [];

    if (req.user.role === 'EMPLOYEE') {
      // Employees can only see their own expenses
      whereClause.submittedById = req.user.userId;
    } else if (req.user.role === 'MANAGER') {
      // Managers can see their subordinates' expenses
      const subordinates = await User.findAll({
        where: { managerId: req.user.userId },
        attributes: ['userId']
      });
      
      const subordinateIds = subordinates.map(sub => sub.userId);
      subordinateIds.push(req.user.userId); // Include manager's own expenses
      
      whereClause.submittedById = subordinateIds;
    } else if (req.user.role === 'ADMIN') {
      // Admins can see all company expenses
      includeUser = [{
        model: User,
        as: 'submittedBy',
        where: { companyId: req.user.companyId },
        attributes: ['userId', 'firstName', 'lastName', 'email']
      }];
    }

    // Add filters
    if (status) {
      whereClause.status = status;
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (startDate && endDate) {
      whereClause.expenseDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows: expenses } = await Expense.findAndCountAll({
      where: whereClause,
      include: [
        ...includeUser,
        {
          model: ApprovalWorkflow,
          as: 'workflow',
          attributes: ['workflowId', 'name', 'rules']
        }
      ],
      ...paginate({ page, limit }, 0),
      order: [['createdAt', 'DESC']]
    });

    const paginationMeta = paginate({ page, limit }, count);

    return sendSuccess(res, 'Expenses retrieved successfully', expenses, paginationMeta.pagination);
  } catch (error) {
    console.error('Get expenses error:', error);
    return sendError(res, 500, 'Failed to retrieve expenses');
  }
};

/**
 * Get expense by ID
 */
const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByPk(id, {
      include: [
        {
          model: User,
          as: 'submittedBy',
          attributes: ['userId', 'firstName', 'lastName', 'email', 'companyId']
        },
        {
          model: ApprovalWorkflow,
          as: 'workflow',
          attributes: ['workflowId', 'name', 'rules']
        }
      ]
    });

    if (!expense) {
      return sendNotFound(res, 'Expense not found');
    }

    // Check access permissions
    const hasAccess = 
      expense.submittedById === req.user.userId || // Own expense
      req.user.role === 'ADMIN' && expense.submittedBy.companyId === req.user.companyId || // Admin in same company
      req.user.role === 'MANAGER' && await User.findOne({ // Manager's subordinate
        where: { userId: expense.submittedById, managerId: req.user.userId }
      });

    if (!hasAccess) {
      return sendError(res, 403, 'Access denied to this expense');
    }

    return sendSuccess(res, 'Expense retrieved successfully', expense);
  } catch (error) {
    console.error('Get expense error:', error);
    return sendError(res, 500, 'Failed to retrieve expense');
  }
};

/**
 * Update expense (only before submission)
 */
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, category, originalAmount, originalCurrency, expenseDate, notes } = req.body;

    const expense = await Expense.findByPk(id);

    if (!expense) {
      return sendNotFound(res, 'Expense not found');
    }

    // Only allow updates for own expenses and in DRAFT status
    if (expense.submittedById !== req.user.userId) {
      return sendError(res, 403, 'Access denied');
    }

    if (expense.status !== 'DRAFT') {
      return sendError(res, 400, 'Cannot update expense that has been submitted');
    }

    // Get company default currency for conversion
    const user = await User.findByPk(req.user.userId, {
      include: [{ model: Company, as: 'company' }]
    });

    const defaultCurrency = user.company.defaultCurrency;

    // Convert currency if needed
    let amountInDefaultCurrency = originalAmount;
    let exchangeRate = 1;

    if (originalCurrency !== defaultCurrency) {
      const conversion = await convertCurrency(originalAmount, originalCurrency, defaultCurrency);
      amountInDefaultCurrency = conversion.convertedAmount;
      exchangeRate = conversion.exchangeRate;
    }

    await expense.update({
      ...(description && { description }),
      ...(category && { category }),
      ...(originalAmount && { originalAmount, amountInDefaultCurrency, exchangeRate }),
      ...(originalCurrency && { originalCurrency }),
      ...(expenseDate && { expenseDate: new Date(expenseDate) }),
      ...(notes !== undefined && { notes })
    });

    return sendSuccess(res, 'Expense updated successfully', expense);
  } catch (error) {
    console.error('Update expense error:', error);
    return sendError(res, 500, 'Failed to update expense');
  }
};

/**
 * Submit expense for approval
 */
const submitExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { workflowId } = req.body;

    const expense = await Expense.findByPk(id);

    if (!expense) {
      return sendNotFound(res, 'Expense not found');
    }

    if (expense.submittedById !== req.user.userId) {
      return sendError(res, 403, 'Access denied');
    }

    if (expense.status !== 'DRAFT') {
      return sendError(res, 400, 'Expense has already been submitted');
    }

    // Validate workflow
    const workflow = await ApprovalWorkflow.findOne({
      where: { 
        workflowId,
        companyId: req.user.companyId,
        isActive: true
      }
    });

    if (!workflow) {
      return sendError(res, 400, 'Invalid or inactive workflow');
    }

    await expense.update({
      status: 'PENDING',
      approvalWorkflowId: workflowId,
      currentApproverIndex: 0,
      submissionDate: new Date()
    });

    return sendSuccess(res, 'Expense submitted for approval', {
      expenseId: expense.expenseId,
      status: expense.status,
      submissionDate: expense.submissionDate
    });
  } catch (error) {
    console.error('Submit expense error:', error);
    return sendError(res, 500, 'Failed to submit expense');
  }
};

/**
 * Approve expense (Manager/Admin role)
 */
const approveExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const expense = await Expense.findByPk(id, {
      include: [
        {
          model: ApprovalWorkflow,
          as: 'workflow'
        },
        {
          model: User,
          as: 'submittedBy',
          attributes: ['userId', 'companyId', 'firstName', 'lastName', 'managerId']
        }
      ]
    });

    if (!expense) {
      return sendNotFound(res, 'Expense not found');
    }

    if (expense.status !== 'PENDING') {
      return sendError(res, 400, 'Expense is not pending approval');
    }

    // Enhanced approval permission check
    const approvalCheck = await checkDetailedApprovalPermission(expense, req.user);
    if (!approvalCheck.canApprove) {
      return sendError(res, 403, approvalCheck.reason);
    }

    // Add approval to the expense
    const newApproval = {
      userId: req.user.userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: req.user.role,
      decision: 'APPROVED',
      comment: comment || null,
      timestamp: new Date(),
      stepIndex: expense.currentApproverIndex,
      stepName: approvalCheck.currentStepName
    };

    const updatedApprovals = [...expense.approvals, newApproval];

    // Process the approval workflow
    const workflowResult = await processApprovalWorkflow(expense, updatedApprovals, req.user);

    await expense.update({
      approvals: updatedApprovals,
      currentApproverIndex: workflowResult.nextApproverIndex,
      status: workflowResult.finalStatus
    });

    // Send notification to next approver if workflow continues
    if (workflowResult.finalStatus === 'PENDING' && workflowResult.nextApproverInfo) {
      await sendApprovalNotification(expense, workflowResult.nextApproverInfo);
    }

    return sendSuccess(res, workflowResult.message, {
      expenseId: expense.expenseId,
      status: workflowResult.finalStatus,
      currentStep: workflowResult.currentStepName,
      nextStep: workflowResult.nextStepName,
      approvals: updatedApprovals,
      isComplete: workflowResult.finalStatus === 'APPROVED'
    });
  } catch (error) {
    console.error('Approve expense error:', error);
    return sendError(res, 500, 'Failed to approve expense');
  }
};

/**
 * Reject expense (Manager/Admin role)
 */
const rejectExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return sendError(res, 400, 'Rejection comment is required');
    }

    const expense = await Expense.findByPk(id, {
      include: [
        {
          model: ApprovalWorkflow,
          as: 'workflow'
        },
        {
          model: User,
          as: 'submittedBy',
          attributes: ['userId', 'companyId', 'firstName', 'lastName', 'managerId']
        }
      ]
    });

    if (!expense) {
      return sendNotFound(res, 'Expense not found');
    }

    if (expense.status !== 'PENDING') {
      return sendError(res, 400, 'Expense is not pending approval');
    }

    // Enhanced approval permission check
    const approvalCheck = await checkDetailedApprovalPermission(expense, req.user);
    if (!approvalCheck.canApprove) {
      return sendError(res, 403, approvalCheck.reason);
    }

    // Add rejection to the expense
    const newApproval = {
      userId: req.user.userId,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userRole: req.user.role,
      decision: 'REJECTED',
      comment: comment,
      timestamp: new Date(),
      stepIndex: expense.currentApproverIndex,
      stepName: approvalCheck.currentStepName
    };

    const updatedApprovals = [...expense.approvals, newApproval];

    await expense.update({
      approvals: updatedApprovals,
      status: 'REJECTED',
      rejectionReason: comment
    });

    // Send notification to expense submitter
    await sendRejectionNotification(expense, req.user, comment);

    return sendSuccess(res, 'Expense rejected successfully', {
      expenseId: expense.expenseId,
      status: 'REJECTED',
      rejectionReason: comment,
      rejectedBy: `${req.user.firstName} ${req.user.lastName}`,
      rejectedAt: new Date()
    });
  } catch (error) {
    console.error('Reject expense error:', error);
    return sendError(res, 500, 'Failed to reject expense');
  }
};

/**
 * Get pending approvals for current user
 */
const getPendingApprovals = async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'submittedAt', order = 'DESC' } = req.query;

    // Find expenses that need approval from current user
    const expenses = await Expense.findAll({
      where: {
        status: 'PENDING'
      },
      include: [
        {
          model: User,
          as: 'submittedBy',
          where: { companyId: req.user.companyId },
          attributes: ['userId', 'firstName', 'lastName', 'email', 'managerId', 'role'],
          include: [
            {
              model: Company,
              as: 'company',
              attributes: ['companyId', 'name']
            }
          ]
        },
        {
          model: ApprovalWorkflow,
          as: 'workflow'
        }
      ],
      order: [['submissionDate', 'ASC']]
    });

    // Filter expenses that require approval from current user
    const filteredExpenses = [];
    
    for (const expense of expenses) {
      const approvalCheck = await checkDetailedApprovalPermission(expense, req.user);
      
      if (approvalCheck.canApprove) {
        // Add workflow context to expense
        const expenseData = expense.toJSON();
        expenseData.currentStep = {
          index: expense.currentApproverIndex,
          name: approvalCheck.currentStepName,
          description: approvalCheck.stepDescription,
          canApprove: true,
          approvalLevel: approvalCheck.approvalLevel
        };
        
        // Add workflow progress
        if (expense.workflow && expense.workflow.rules) {
          const rules = expense.workflow.rules;
          expenseData.workflowProgress = {
            totalSteps: rules.approvalSteps ? rules.approvalSteps.length : 1,
            currentStepIndex: expense.currentApproverIndex,
            completedSteps: expense.approvals.filter(a => a.decision === 'APPROVED').length,
            workflowType: rules.workflowType || 'sequential'
          };
        }
        
        // Calculate days pending
        expenseData.daysPending = Math.ceil(
          (new Date() - new Date(expense.submissionDate)) / (1000 * 60 * 60 * 24)
        );
        
        filteredExpenses.push(expenseData);
      }
    }

    // Sort by priority (amount and days pending)
    filteredExpenses.sort((a, b) => {
      const priorityA = (a.amount * 0.7) + (a.daysPending * 0.3);
      const priorityB = (b.amount * 0.7) + (b.daysPending * 0.3);
      return priorityB - priorityA;
    });

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

    // Summary statistics
    const summary = {
      totalPending: filteredExpenses.length,
      totalAmount: filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
      avgDaysPending: filteredExpenses.length > 0 
        ? Math.round(filteredExpenses.reduce((sum, exp) => sum + exp.daysPending, 0) / filteredExpenses.length)
        : 0,
      urgentCount: filteredExpenses.filter(exp => exp.daysPending > 5).length,
      highValueCount: filteredExpenses.filter(exp => exp.amount > 1000).length
    };

    const paginationMeta = paginate({ page, limit }, filteredExpenses.length);

    return sendSuccess(res, 'Pending approvals retrieved successfully', {
      expenses: paginatedExpenses,
      summary,
      pagination: paginationMeta.pagination
    });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    return sendError(res, 500, 'Failed to retrieve pending approvals');
  }
};

/**
 * Enhanced helper function to check detailed approval permission with workflow context
 */
const checkDetailedApprovalPermission = async (expense, user) => {
  try {
    // Check if user already approved/rejected this expense
    const existingApproval = expense.approvals.find(approval => approval.userId === user.userId);
    if (existingApproval) {
      return {
        canApprove: false,
        reason: `You have already ${existingApproval.decision.toLowerCase()} this expense`,
        currentStepName: null,
        stepDescription: null,
        approvalLevel: null
      };
    }

    // Admin can approve any expense in their company (bypass workflow)
    if (user.role === 'ADMIN') {
      return {
        canApprove: true,
        reason: 'Admin override permission',
        currentStepName: 'Admin Override',
        stepDescription: 'Administrator can approve any expense',
        approvalLevel: 'ADMIN_OVERRIDE'
      };
    }

    // Get workflow rules
    if (!expense.workflow || !expense.workflow.rules) {
      // Default workflow: Manager approval for subordinates
      if (user.role === 'MANAGER') {
        const subordinate = await User.findOne({
          where: { userId: expense.submittedBy, managerId: user.userId }
        });
        if (subordinate) {
          return {
            canApprove: true,
            reason: 'Manager approval for subordinate',
            currentStepName: 'Manager Approval',
            stepDescription: 'Direct manager approval required',
            approvalLevel: 'MANAGER'
          };
        }
      }
      return {
        canApprove: false,
        reason: 'No approval workflow defined and user is not authorized',
        currentStepName: null,
        stepDescription: null,
        approvalLevel: null
      };
    }

    const rules = expense.workflow.rules;
    const currentStepIndex = expense.currentApproverIndex || 0;

    // Handle different workflow types
    switch (rules.workflowType) {
      case 'sequential':
        return await checkSequentialApprovalPermission(expense, user, rules, currentStepIndex);
      
      case 'percentage':
        return await checkPercentageApprovalPermission(expense, user, rules);
      
      case 'specific':
        return await checkSpecificApprovalPermission(expense, user, rules);
      
      case 'hybrid':
        return await checkHybridApprovalPermission(expense, user, rules, currentStepIndex);
      
      default:
        return {
          canApprove: false,
          reason: 'Unknown workflow type',
          currentStepName: null,
          stepDescription: null,
          approvalLevel: null
        };
    }
  } catch (error) {
    console.error('Check detailed approval permission error:', error);
    return {
      canApprove: false,
      reason: 'Error checking approval permission',
      currentStepName: null,
      stepDescription: null,
      approvalLevel: null
    };
  }
};

/**
 * Check sequential approval permission (Step by Step)
 */
const checkSequentialApprovalPermission = async (expense, user, rules, currentStepIndex) => {
  if (!rules.approvalSteps || rules.approvalSteps.length === 0) {
    return {
      canApprove: false,
      reason: 'No approval steps defined',
      currentStepName: null,
      stepDescription: null,
      approvalLevel: null
    };
  }

  // Check if all previous steps are completed
  for (let i = 0; i < currentStepIndex; i++) {
    const stepApproval = expense.approvals.find(a => a.stepIndex === i && a.decision === 'APPROVED');
    if (!stepApproval) {
      return {
        canApprove: false,
        reason: `Step ${i + 1} is not yet approved`,
        currentStepName: null,
        stepDescription: null,
        approvalLevel: null
      };
    }
  }

  // Check if current step is beyond workflow
  if (currentStepIndex >= rules.approvalSteps.length) {
    return {
      canApprove: false,
      reason: 'All approval steps completed',
      currentStepName: null,
      stepDescription: null,
      approvalLevel: null
    };
  }

  const currentStep = rules.approvalSteps[currentStepIndex];

  // Handle manager-first approval (IS_MANAGER_APPROVER)
  if (rules.isManagerApprover && currentStepIndex === 0) {
    const subordinate = await User.findOne({
      where: { userId: expense.submittedBy, managerId: user.userId }
    });
    if (subordinate) {
      return {
        canApprove: true,
        reason: 'Manager first approval required',
        currentStepName: currentStep.name || 'Manager Approval',
        stepDescription: currentStep.description || 'Direct manager must approve first',
        approvalLevel: 'MANAGER_FIRST'
      };
    }
  }

  // Check step-specific rules
  if (currentStep.approverType === 'ROLE') {
    if (user.role === currentStep.approverValue) {
      return {
        canApprove: true,
        reason: `Role-based approval: ${currentStep.approverValue}`,
        currentStepName: currentStep.name,
        stepDescription: currentStep.description,
        approvalLevel: currentStep.approverValue
      };
    }
  } else if (currentStep.approverType === 'USER') {
    if (user.userId === currentStep.approverValue) {
      return {
        canApprove: true,
        reason: 'Specific user approval',
        currentStepName: currentStep.name,
        stepDescription: currentStep.description,
        approvalLevel: 'SPECIFIC_USER'
      };
    }
  } else if (currentStep.approverType === 'MANAGER') {
    const subordinate = await User.findOne({
      where: { userId: expense.submittedBy, managerId: user.userId }
    });
    if (subordinate) {
      return {
        canApprove: true,
        reason: 'Manager approval',
        currentStepName: currentStep.name,
        stepDescription: currentStep.description,
        approvalLevel: 'MANAGER'
      };
    }
  }

  return {
    canApprove: false,
    reason: `Not authorized for step ${currentStepIndex + 1}: ${currentStep.name}`,
    currentStepName: currentStep.name,
    stepDescription: currentStep.description,
    approvalLevel: null
  };
};

/**
 * Check percentage approval permission
 */
const checkPercentageApprovalPermission = async (expense, user, rules) => {
  if (!rules.eligibleApprovers || rules.eligibleApprovers.length === 0) {
    return {
      canApprove: false,
      reason: 'No eligible approvers defined',
      currentStepName: 'Percentage Approval',
      stepDescription: null,
      approvalLevel: null
    };
  }

  // Check if user is in eligible approvers list
  const isEligible = rules.eligibleApprovers.some(approver => {
    if (approver.type === 'ROLE') {
      return user.role === approver.value;
    } else if (approver.type === 'USER') {
      return user.userId === approver.value;
    }
    return false;
  });

  if (!isEligible) {
    return {
      canApprove: false,
      reason: 'Not in eligible approvers list',
      currentStepName: 'Percentage Approval',
      stepDescription: `Requires ${rules.thresholdPercentage}% approval from eligible approvers`,
      approvalLevel: null
    };
  }

  return {
    canApprove: true,
    reason: 'Eligible for percentage approval',
    currentStepName: 'Percentage Approval',
    stepDescription: `Requires ${rules.thresholdPercentage}% approval from eligible approvers`,
    approvalLevel: 'PERCENTAGE'
  };
};

/**
 * Check specific approval permission
 */
const checkSpecificApprovalPermission = async (expense, user, rules) => {
  if (!rules.requiredApprovers || rules.requiredApprovers.length === 0) {
    return {
      canApprove: false,
      reason: 'No required approvers defined',
      currentStepName: 'Specific Approval',
      stepDescription: null,
      approvalLevel: null
    };
  }

  // Check if user is in required approvers list
  const isRequired = rules.requiredApprovers.some(approver => {
    if (approver.type === 'ROLE') {
      return user.role === approver.value;
    } else if (approver.type === 'USER') {
      return user.userId === approver.value;
    }
    return false;
  });

  if (!isRequired) {
    return {
      canApprove: false,
      reason: 'Not in required approvers list',
      currentStepName: 'Specific Approval',
      stepDescription: 'All specified approvers must approve',
      approvalLevel: null
    };
  }

  return {
    canApprove: true,
    reason: 'Required approver',
    currentStepName: 'Specific Approval',
    stepDescription: 'All specified approvers must approve',
    approvalLevel: 'SPECIFIC'
  };
};

/**
 * Check hybrid approval permission (combines multiple rules)
 */
const checkHybridApprovalPermission = async (expense, user, rules, currentStepIndex) => {
  // Hybrid rules can include sequential + percentage or sequential + specific
  if (rules.primaryRule === 'sequential' && rules.approvalSteps) {
    const sequentialCheck = await checkSequentialApprovalPermission(expense, user, rules, currentStepIndex);
    if (sequentialCheck.canApprove) {
      return {
        ...sequentialCheck,
        currentStepName: 'Hybrid: ' + sequentialCheck.currentStepName,
        approvalLevel: 'HYBRID_SEQUENTIAL'
      };
    }
  }

  // Check secondary rules if sequential fails or is not primary
  if (rules.secondaryRule === 'percentage') {
    const percentageCheck = await checkPercentageApprovalPermission(expense, user, rules);
    if (percentageCheck.canApprove) {
      return {
        ...percentageCheck,
        currentStepName: 'Hybrid: ' + percentageCheck.currentStepName,
        approvalLevel: 'HYBRID_PERCENTAGE'
      };
    }
  }

  if (rules.secondaryRule === 'specific') {
    const specificCheck = await checkSpecificApprovalPermission(expense, user, rules);
    if (specificCheck.canApprove) {
      return {
        ...specificCheck,
        currentStepName: 'Hybrid: ' + specificCheck.currentStepName,
        approvalLevel: 'HYBRID_SPECIFIC'
      };
    }
  }

  return {
    canApprove: false,
    reason: 'Does not meet any hybrid approval criteria',
    currentStepName: 'Hybrid Approval',
    stepDescription: 'Multiple approval criteria required',
    approvalLevel: null
  };
};

/**
 * Enhanced function to check if approval workflow is complete
 */
const checkEnhancedApprovalComplete = (expense, workflow) => {
  if (!workflow || !workflow.rules) {
    return false;
  }

  const rules = workflow.rules;
  const approvals = expense.approvals || [];
  const approvedApprovals = approvals.filter(a => a.decision === 'APPROVED');

  switch (rules.workflowType) {
    case 'sequential':
      // All steps must be completed in order
      if (!rules.approvalSteps || rules.approvalSteps.length === 0) {
        return false;
      }
      
      // Check if we have approvals for all steps
      const completedSteps = new Set();
      for (const approval of approvedApprovals) {
        if (approval.stepIndex !== undefined) {
          completedSteps.add(approval.stepIndex);
        }
      }
      
      // All steps from 0 to length-1 must be completed
      for (let i = 0; i < rules.approvalSteps.length; i++) {
        if (!completedSteps.has(i)) {
          return false;
        }
      }
      return true;

    case 'percentage':
      if (!rules.eligibleApprovers || !rules.thresholdPercentage) {
        return false;
      }
      const totalEligible = rules.eligibleApprovers.length;
      const requiredApprovals = Math.ceil((rules.thresholdPercentage / 100) * totalEligible);
      return approvedApprovals.length >= requiredApprovals;

    case 'specific':
      if (!rules.requiredApprovers || rules.requiredApprovers.length === 0) {
        return false;
      }
      
      // Check if all required approvers have approved
      const requiredApproverIds = rules.requiredApprovers
        .filter(ra => ra.type === 'USER')
        .map(ra => ra.value);
      
      const requiredRoles = rules.requiredApprovers
        .filter(ra => ra.type === 'ROLE')
        .map(ra => ra.value);
      
      // Check user-specific approvals
      for (const userId of requiredApproverIds) {
        const hasApproval = approvedApprovals.some(a => a.userId === userId);
        if (!hasApproval) {
          return false;
        }
      }
      
      // Check role-based approvals
      for (const role of requiredRoles) {
        const hasRoleApproval = approvedApprovals.some(a => a.userRole === role);
        if (!hasRoleApproval) {
          return false;
        }
      }
      
      return true;

    case 'hybrid':
      // For hybrid, check if either primary or secondary rule is satisfied
      let primarySatisfied = false;
      let secondarySatisfied = false;
      
      if (rules.primaryRule === 'sequential') {
        // Create a temporary expense object for checking
        const tempExpense = { ...expense, currentApproverIndex: rules.approvalSteps?.length || 0 };
        primarySatisfied = checkEnhancedApprovalComplete(tempExpense, { rules: { ...rules, workflowType: 'sequential' }});
      }
      
      if (rules.secondaryRule === 'percentage') {
        secondarySatisfied = checkEnhancedApprovalComplete(expense, { rules: { ...rules, workflowType: 'percentage' }});
      } else if (rules.secondaryRule === 'specific') {
        secondarySatisfied = checkEnhancedApprovalComplete(expense, { rules: { ...rules, workflowType: 'specific' }});
      }
      
      return primarySatisfied || secondarySatisfied;

    default:
      return false;
  }
};

/**
 * Send approval notification
 */
const sendApprovalNotification = async (expense, approver, decision) => {
  try {
    // In a real application, this would send email/SMS notifications
    console.log(`Expense ${expense.expenseId} ${decision} by ${approver.firstName} ${approver.lastName}`);
    
    // You can integrate with email services like SendGrid, AWS SES, etc.
    // await emailService.sendApprovalNotification(expense, approver, decision);
  } catch (error) {
    console.error('Send approval notification error:', error);
  }
};

/**
 * Send rejection notification
 */
const sendRejectionNotification = async (expense, approver, comment) => {
  try {
    // In a real application, this would send email/SMS notifications
    console.log(`Expense ${expense.expenseId} rejected by ${approver.firstName} ${approver.lastName}: ${comment}`);
    
    // You can integrate with email services like SendGrid, AWS SES, etc.
    // await emailService.sendRejectionNotification(expense, approver, comment);
  } catch (error) {
    console.error('Send rejection notification error:', error);
  }
};

/**
 * Helper function to check if user can approve expense (Legacy - kept for backward compatibility)
 */
const checkApprovalPermission = async (expense, user) => {
  const detailedCheck = await checkDetailedApprovalPermission(expense, user);
  return detailedCheck.canApprove;
};

/**
 * Helper function to check if approval is complete (Legacy - kept for backward compatibility)
 */
const checkApprovalComplete = (workflow, approvals) => {
  // Create a temporary expense object for the enhanced function
  const tempExpense = { approvals: approvals || [] };
  return checkEnhancedApprovalComplete(tempExpense, workflow);
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  submitExpense,
  approveExpense,
  rejectExpense,
  getPendingApprovals
};