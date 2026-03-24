const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WaitingList = sequelize.define('WaitingList', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  date_joined: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  priority_rank: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  meld_score: { // Additional helpful attribute for priority
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'waiting_list',
  indexes: [
    { fields: ['recipient_id'] },
    { fields: ['priority_rank'] }
  ]
});

module.exports = WaitingList;
