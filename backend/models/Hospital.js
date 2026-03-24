const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Hospital = sequelize.define('Hospital', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false
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
  contact_number: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  facilities: {
    type: DataTypes.JSON,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  transplant_capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  specializations: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  accreditation: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'hospitals',
  indexes: [
    { fields: ['city'] },
    { fields: ['state'] }
  ]
});

module.exports = Hospital;
