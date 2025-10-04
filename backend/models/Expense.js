const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Expense = sequelize.define('Expense', {
  expenseId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'TRAVEL',
      'ACCOMMODATION',
      'MEALS',
      'TRANSPORTATION',
      'OFFICE_SUPPLIES',
      'EQUIPMENT',
      'SOFTWARE',
      'TRAINING',
      'MARKETING',
      'ENTERTAINMENT',
      'OTHER'
    ),
    allowNull: false,
    defaultValue: 'OTHER'
  },
  submissionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  originalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  originalCurrency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD'
  },
  amountInDefaultCurrency: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  receiptUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'),
    allowNull: false,
    defaultValue: 'DRAFT'
  },
  submittedById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'userId'
    }
  },
  approvalWorkflowId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'approval_workflows',
      key: 'workflowId'
    }
  },
  currentApproverIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  approvals: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  exchangeRate: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true
  },
  expenseDate: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'expenses',
  timestamps: true
});

module.exports = Expense;