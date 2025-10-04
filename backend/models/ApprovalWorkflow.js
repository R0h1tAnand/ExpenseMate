const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ApprovalWorkflow = sequelize.define('ApprovalWorkflow', {
  workflowId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'companyId'
    }
  },
  rules: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      type: 'sequential',
      steps: [],
      thresholdPercentage: null,
      requiredApprovers: [],
      conditions: {}
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'approval_workflows',
  timestamps: true
});

module.exports = ApprovalWorkflow;