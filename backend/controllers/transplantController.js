const { TransplantRecord, Matching, Donor, Recipient, Hospital, Doctor, Organ } = require('../models');

// @desc    Get all transplant records
// @route   GET /api/transplants
// @access  Private
exports.getTransplants = async (req, res, next) => {
  try {
    const { hospital_id, doctor_id, outcome } = req.query;
    const where = {};

    if (hospital_id) where.hospital_id = hospital_id;
    if (doctor_id) where.doctor_id = doctor_id;
    if (outcome) where.outcome = outcome;

    const transplants = await TransplantRecord.findAll({
      where,
      include: [
        { 
          model: Matching, 
          as: 'match',
          include: [
            { model: Organ, as: 'organ' }
          ]
        },
        { model: Donor, as: 'donor' },
        { model: Recipient, as: 'recipient' },
        { model: Hospital, as: 'hospital' },
        { model: Doctor, as: 'doctor' }
      ],
      order: [['transplant_date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: transplants.length,
      data: transplants
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transplant record
// @route   GET /api/transplants/:id
// @access  Private
exports.getTransplant = async (req, res, next) => {
  try {
    const transplant = await TransplantRecord.findByPk(req.params.id, {
      include: [
        { 
          model: Matching, 
          as: 'match',
          include: [
            { model: Organ, as: 'organ' }
          ]
        },
        { model: Donor, as: 'donor' },
        { model: Recipient, as: 'recipient' },
        { model: Hospital, as: 'hospital' },
        { model: Doctor, as: 'doctor' }
      ]
    });

    if (!transplant) {
      return res.status(404).json({
        success: false,
        message: 'Transplant record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: transplant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transplant record
// @route   POST /api/transplants
// @access  Private (Hospital Staff/Doctor)
exports.createTransplant = async (req, res, next) => {
  try {
    const { matching_id, hospital_id, doctor_id, transplant_date } = req.body;

    // Verify matching is approved
    const matching = await Matching.findByPk(matching_id);
    
    if (!matching) {
      return res.status(404).json({
        success: false,
        message: 'Matching not found'
      });
    }

    if (matching.approval_status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Matching must be approved before creating transplant record'
      });
    }

    // Create transplant record
    const transplant = await TransplantRecord.create({
      ...req.body,
      donor_id: matching.donor_id,
      recipient_id: matching.recipient_id
    });

    // Update statuses
    await Donor.update(
      { donation_status: 'donated' },
      { where: { id: matching.donor_id } }
    );

    await Recipient.update(
      { status: 'transplanted' },
      { where: { id: matching.recipient_id } }
    );

    await Organ.update(
      { status: 'Transplanted' },
      { where: { id: matching.organ_id } }
    );

    res.status(201).json({
      success: true,
      data: transplant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transplant record
// @route   PUT /api/transplants/:id
// @access  Private (Hospital Staff/Doctor)
exports.updateTransplant = async (req, res, next) => {
  try {
    const transplant = await TransplantRecord.findByPk(req.params.id);

    if (!transplant) {
      return res.status(404).json({
        success: false,
        message: 'Transplant record not found'
      });
    }

    await transplant.update(req.body);

    res.status(200).json({
      success: true,
      data: transplant
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transplant record
// @route   DELETE /api/transplants/:id
// @access  Private (Admin only)
exports.deleteTransplant = async (req, res, next) => {
  try {
    const transplant = await TransplantRecord.findByPk(req.params.id);

    if (!transplant) {
      return res.status(404).json({
        success: false,
        message: 'Transplant record not found'
      });
    }

    await transplant.destroy();

    res.status(200).json({
      success: true,
      message: 'Transplant record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
