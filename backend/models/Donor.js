const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Donor = sequelize.define('Donor', {
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
    allowNull: true
  },
  cause_of_death: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  donor_type: {
    type: DataTypes.ENUM('Live', 'Deceased'),
    allowNull: false,
    defaultValue: 'Deceased'
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
  medical_history: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  donation_status: {
    type: DataTypes.ENUM('available', 'matched', 'donated', 'unavailable'),
    allowNull: false,
    defaultValue: 'available'
  },
  registration_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'donors',
  indexes: [
    { fields: ['blood_group'] },
    { fields: ['donation_status'] },
    { fields: ['city'] }
  ]
});

module.exports = Donor;
