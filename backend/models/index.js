const { sequelize } = require('../config/db');

// Import all models
const Company = require('./Company');
const User = require('./User');
const ApprovalWorkflow = require('./ApprovalWorkflow');
const Expense = require('./Expense');

// Define associations
const setupAssociations = () => {
  // Company associations
  Company.hasMany(User, {
    foreignKey: 'companyId',
    as: 'employees',
    onDelete: 'CASCADE'
  });

  Company.hasMany(ApprovalWorkflow, {
    foreignKey: 'companyId',
    as: 'workflows',
    onDelete: 'CASCADE'
  });

  // User associations
  User.belongsTo(Company, {
    foreignKey: 'companyId',
    as: 'company'
  });

  User.hasMany(User, {
    foreignKey: 'managerId',
    as: 'subordinates'
  });

  User.belongsTo(User, {
    foreignKey: 'managerId',
    as: 'manager'
  });

  User.hasMany(Expense, {
    foreignKey: 'submittedById',
    as: 'expenses',
    onDelete: 'CASCADE'
  });

  // ApprovalWorkflow associations
  ApprovalWorkflow.belongsTo(Company, {
    foreignKey: 'companyId',
    as: 'company'
  });

  ApprovalWorkflow.hasMany(Expense, {
    foreignKey: 'approvalWorkflowId',
    as: 'expenses'
  });

  // Expense associations
  Expense.belongsTo(User, {
    foreignKey: 'submittedById',
    as: 'submittedBy'
  });

  Expense.belongsTo(ApprovalWorkflow, {
    foreignKey: 'approvalWorkflowId',
    as: 'workflow'
  });
};

// Setup associations
setupAssociations();

// Sync database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  Company,
  User,
  ApprovalWorkflow,
  Expense,
  syncDatabase
};