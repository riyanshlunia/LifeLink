const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TransplantRecord = sequelize.define('TransplantRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  matching_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'matchings',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  donor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'donors',
      key: 'id'
    }
  },
  recipient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'recipients',
      key: 'id'
    }
  },
  hospital_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'hospitals',
      key: 'id'
    }
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  transplant_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  surgery_duration_hours: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true
  },
  outcome: {
    type: DataTypes.ENUM('successful', 'complicated', 'failed', 'pending'),
    allowNull: false,
    defaultValue: 'pending'
  },
  complications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  follow_up_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  discharge_date: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'transplant_records',
  indexes: [
    { fields: ['matching_id'] },
    { fields: ['hospital_id'] },
    { fields: ['doctor_id'] },
    { fields: ['transplant_date'] },
    { fields: ['outcome'] }
  ]
});

module.exports = TransplantRecord;
