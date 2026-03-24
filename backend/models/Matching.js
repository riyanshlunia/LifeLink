const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Matching = sequelize.define('Matching', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  donor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'donors',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  recipient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'recipients',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  organ_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'organs',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  compatibility_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  match_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  compatibility_status: {
    type: DataTypes.ENUM('compatible', 'partially_compatible', 'incompatible'),
    allowNull: false
  },
  // removed redundant matching_date field if it existed separately or ensure standard naming
  approval_status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  approval_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'matchings',
  indexes: [
    { fields: ['donor_id'] },
    { fields: ['recipient_id'] },
    { fields: ['organ_id'] },
    { fields: ['approval_status'] },
    { fields: ['compatibility_status'] }
  ]
});

module.exports = Matching;
