const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Recipient = sequelize.define('Recipient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  full_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  blood_group: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: false
  },
  hla_type: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  urgency_score: {
     type: DataTypes.INTEGER,
     allowNull: true
  },
  contact_number: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  state: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  medical_condition: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  required_organ: {
    type: DataTypes.ENUM('heart', 'kidney', 'liver', 'lung', 'pancreas', 'intestine', 'cornea'),
    allowNull: false
  },
  urgency_level: {
    type: DataTypes.ENUM('critical', 'high', 'medium', 'low'),
    allowNull: false,
    defaultValue: 'medium'
  },
  waiting_since: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('waiting', 'matched', 'transplanted', 'removed'),
    allowNull: false,
    defaultValue: 'waiting'
  }
}, {
  tableName: 'recipients',
  indexes: [
    { fields: ['blood_group'] },
    { fields: ['required_organ'] },
    { fields: ['urgency_level'] },
    { fields: ['status'] },
    { fields: ['waiting_since'] }
  ]
});

module.exports = Recipient;
