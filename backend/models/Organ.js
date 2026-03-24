const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Organ = sequelize.define('Organ', {
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
  organ_type: {
    type: DataTypes.ENUM('heart', 'kidney', 'liver', 'lung', 'pancreas', 'intestine', 'cornea'),
    allowNull: false
  },
  procurement_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Available', 'In Transit', 'Transplanted'), // Updated as per request
    allowNull: false,
    defaultValue: 'Available'
  },
  medical_notes: { // Keeping utility field
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'organs',
  indexes: [
    { fields: ['donor_id'] },
    { fields: ['organ_type'] },
    { fields: ['status'] }
  ]
});

module.exports = Organ;
