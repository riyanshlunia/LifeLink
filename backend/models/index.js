const sequelize = require('../config/database');
const User = require('./User');
const Donor = require('./Donor');
const Recipient = require('./Recipient');
const Organ = require('./Organ');
const Hospital = require('./Hospital');
const Doctor = require('./Doctor');
const Matching = require('./Matching');
const TransplantRecord = require('./TransplantRecord');
const AuditLog = require('./AuditLog');
const WaitingList = require('./WaitingList');

// Define associations

// Hospital has many Doctors
Hospital.hasMany(Doctor, { foreignKey: 'hospital_id', as: 'doctors' });
Doctor.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });

// Donor has many Organs
Donor.hasMany(Organ, { foreignKey: 'donor_id', as: 'organs' });
Organ.belongsTo(Donor, { foreignKey: 'donor_id', as: 'donor' });

// Matching associations
Matching.belongsTo(Donor, { foreignKey: 'donor_id', as: 'donor' });
Matching.belongsTo(Recipient, { foreignKey: 'recipient_id', as: 'recipient' });
Matching.belongsTo(Organ, { foreignKey: 'organ_id', as: 'organ' });

Donor.hasMany(Matching, { foreignKey: 'donor_id', as: 'matches' });
Recipient.hasMany(Matching, { foreignKey: 'recipient_id', as: 'matches' });
Organ.hasMany(Matching, { foreignKey: 'organ_id', as: 'matches' });

// TransplantRecord associations
TransplantRecord.belongsTo(Matching, { foreignKey: 'matching_id', as: 'match' });
TransplantRecord.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });
TransplantRecord.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });
TransplantRecord.belongsTo(Donor, { foreignKey: 'donor_id', as: 'donor' });
TransplantRecord.belongsTo(Recipient, { foreignKey: 'recipient_id', as: 'recipient' });

Matching.hasOne(TransplantRecord, { foreignKey: 'matching_id', as: 'transplant' });
Hospital.hasMany(TransplantRecord, { foreignKey: 'hospital_id', as: 'transplants' });
Doctor.hasMany(TransplantRecord, { foreignKey: 'doctor_id', as: 'transplants' });
Donor.hasMany(TransplantRecord, { foreignKey: 'donor_id', as: 'transplants' });
Recipient.hasMany(TransplantRecord, { foreignKey: 'recipient_id', as: 'transplants' });

// User associations
User.belongsTo(Hospital, { foreignKey: 'hospital_id', as: 'hospital' });
User.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

// WaitingList associations
Recipient.hasOne(WaitingList, { foreignKey: 'recipient_id', as: 'waitingEntry' });
WaitingList.belongsTo(Recipient, { foreignKey: 'recipient_id', as: 'recipient' });

module.exports = {
  sequelize,
  User,
  Donor,
  Recipient,
  Organ,
  Hospital,
  Doctor,
  Matching,
  TransplantRecord,
  AuditLog,
  WaitingList
};
