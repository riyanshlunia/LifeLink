const { 
  Donor, 
  Recipient, 
  Matching, 
  TransplantRecord, 
  Hospital, 
  Doctor, 
  Organ,
  sequelize 
} = require('../models');
const { Op } = require('sequelize');

// @desc    Get combined list of active donors and recipients (Set Operation: UNION)
// @route   GET /api/dashboard/participants
// @access  Private (Admin)
exports.getParticipants = async (req, res, next) => {
  try {
    const [results, metadata] = await sequelize.query(`
      SELECT 'Donor' as type, full_name, blood_group, donation_status as status 
      FROM donors 
      WHERE donation_status = 'Approved'
      UNION
      SELECT 'Recipient' as type, full_name, blood_group, status 
      FROM recipients 
      WHERE status = 'waiting'
    `);
    
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard statistics
// @route   GET /api/dashboard/admin
// @access  Private (Admin only)
exports.getAdminDashboard = async (req, res, next) => {
  try {
    // Get counts
    const donorCount = await Donor.count();
    const recipientCount = await Recipient.count();
    const hospitalCount = await Hospital.count();
    const doctorCount = await Doctor.count();
    const matchingCount = await Matching.count();
    const transplantCount = await TransplantRecord.count();

    // Get donors by status
    const donorsByStatus = await Donor.findAll({
      attributes: [
        'donation_status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['donation_status'],
      raw: true
    });

    // Get recipients by status
    const recipientsByStatus = await Recipient.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Get recipients by urgency
    const recipientsByUrgency = await Recipient.findAll({
      attributes: [
        'urgency_level',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { status: 'waiting' },
      group: ['urgency_level'],
      raw: true
    });

    // Get matchings by status
    const matchingsByStatus = await Matching.findAll({
      attributes: [
        'approval_status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['approval_status'],
      raw: true
    });

    // Get transplants by outcome
    const transplantsByOutcome = await TransplantRecord.findAll({
      attributes: [
        'outcome',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['outcome'],
      raw: true
    });

    // Get organs by type
    const organsByType = await Organ.findAll({
      attributes: [
        'organ_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { status: 'Available' },
      group: ['organ_type'],
      raw: true
    });

    // Recent transplants
    const recentTransplants = await TransplantRecord.findAll({
      limit: 5,
      order: [['transplant_date', 'DESC']],
      include: [
        { model: Donor, as: 'donor', attributes: ['full_name'] },
        { model: Recipient, as: 'recipient', attributes: ['full_name'] },
        { model: Hospital, as: 'hospital', attributes: ['name'] }
      ]
    });

    // Pending approvals
    const pendingApprovals = await Matching.count({
      where: { approval_status: 'pending' }
    });


    // Get top performing hospitals (GROUP BY + HAVING example)
    const topHospitals = await TransplantRecord.findAll({
      attributes: [
        'hospital_id',
        [sequelize.fn('COUNT', sequelize.col('TransplantRecord.id')), 'transplant_count']
      ],
      group: ['hospital_id'],
      having: sequelize.literal('COUNT(TransplantRecord.id) >= 1'),
      include: [{ model: Hospital, as: 'hospital', attributes: ['name', 'city'] }],
      order: [[sequelize.literal('transplant_count'), 'DESC']],
      limit: 5
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          donors: donorCount,
          recipients: recipientCount,
          hospitals: hospitalCount,
          doctors: doctorCount,
          matchings: matchingCount,
          transplants: transplantCount,
          pendingApprovals
        },
        donorsByStatus,
        recipientsByStatus,
        recipientsByUrgency,
        matchingsByStatus,
        transplantsByOutcome,
        organsByType,
        recentTransplants,
        topHospitals
      }
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get hospital dashboard statistics
// @route   GET /api/dashboard/hospital/:hospitalId
// @access  Private (Hospital Staff)
exports.getHospitalDashboard = async (req, res, next) => {
  try {
    const hospitalId = req.params.hospitalId;

    // Get hospital info
    const hospital = await Hospital.findByPk(hospitalId, {
      include: [{ model: Doctor, as: 'doctors' }]
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // Get transplants count
    const transplantCount = await TransplantRecord.count({
      where: { hospital_id: hospitalId }
    });

    // Transplants by outcome
    const transplantsByOutcome = await TransplantRecord.findAll({
      attributes: [
        'outcome',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { hospital_id: hospitalId },
      group: ['outcome'],
      raw: true
    });

    // Recent transplants
    const recentTransplants = await TransplantRecord.findAll({
      where: { hospital_id: hospitalId },
      limit: 10,
      order: [['transplant_date', 'DESC']],
      include: [
        { model: Donor, as: 'donor', attributes: ['full_name'] },
        { model: Recipient, as: 'recipient', attributes: ['full_name'] },
        { model: Doctor, as: 'doctor', attributes: ['full_name'] }
      ]
    });

    // Upcoming scheduled transplants
    const upcomingTransplants = await TransplantRecord.findAll({
      where: {
        hospital_id: hospitalId,
        transplant_date: { [Op.gte]: new Date() },
        outcome: 'pending'
      },
      order: [['transplant_date', 'ASC']],
      include: [
        { model: Recipient, as: 'recipient' },
        { model: Doctor, as: 'doctor' }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        hospital,
        overview: {
          doctors: hospital.doctors.length,
          totalTransplants: transplantCount,
          capacity: hospital.transplant_capacity
        },
        transplantsByOutcome,
        recentTransplants,
        upcomingTransplants
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor dashboard statistics
// @route   GET /api/dashboard/doctor/:doctorId
// @access  Private (Doctor)
exports.getDoctorDashboard = async (req, res, next) => {
  try {
    const doctorId = req.params.doctorId;

    // Get doctor info
    const doctor = await Doctor.findByPk(doctorId, {
      include: [{ model: Hospital, as: 'hospital' }]
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get transplants count
    const transplantCount = await TransplantRecord.count({
      where: { doctor_id: doctorId }
    });

    // Transplants by outcome
    const transplantsByOutcome = await TransplantRecord.findAll({
      attributes: [
        'outcome',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: { doctor_id: doctorId },
      group: ['outcome'],
      raw: true
    });

    // Assigned cases
    const assignedCases = await TransplantRecord.findAll({
      where: {
        doctor_id: doctorId,
        outcome: 'pending'
      },
      include: [
        { 
          model: Matching, 
          as: 'match',
          include: [{ model: Organ, as: 'organ' }]
        },
        { model: Recipient, as: 'recipient' },
        { model: Hospital, as: 'hospital' }
      ],
      order: [['transplant_date', 'ASC']]
    });

    // Recent completed transplants
    const recentTransplants = await TransplantRecord.findAll({
      where: {
        doctor_id: doctorId,
        outcome: { [Op.ne]: 'pending' }
      },
      limit: 10,
      order: [['transplant_date', 'DESC']],
      include: [
        { model: Donor, as: 'donor', attributes: ['full_name'] },
        { model: Recipient, as: 'recipient', attributes: ['full_name'] }
      ]
    });

    res.status(200).json({
      success: true,
      data: {
        doctor,
        overview: {
          totalTransplants: transplantCount,
          pendingCases: assignedCases.length
        },
        transplantsByOutcome,
        assignedCases,
        recentTransplants
      }
    });
  } catch (error) {
    next(error);
  }
};
