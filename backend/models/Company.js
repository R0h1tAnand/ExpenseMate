const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Company = sequelize.define('Company', {
  companyId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  defaultCurrency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD'
  }
}, {
  tableName: 'companies',
  timestamps: true
});

module.exports = Company;