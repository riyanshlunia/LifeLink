const { Hospital, Doctor, TransplantRecord } = require('../models');

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Private
exports.getHospitals = async (req, res, next) => {
  try {
    const { city, state } = req.query;
    const where = {};

    if (city) where.city = city;
    if (state) where.state = state;

    const hospitals = await Hospital.findAll({
      where,
      include: [{ model: Doctor, as: 'doctors' }],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hospital
// @route   GET /api/hospitals/:id
// @access  Private
exports.getHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id, {
      include: [
        { model: Doctor, as: 'doctors' },
        { model: TransplantRecord, as: 'transplants' }
      ]
    });

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    res.status(200).json({
      success: true,
      data: hospital
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new hospital
// @route   POST /api/hospitals
// @access  Private (Admin only)
exports.createHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.create(req.body);

    res.status(201).json({
      success: true,
      data: hospital
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hospital
// @route   PUT /api/hospitals/:id
// @access  Private (Admin only)
exports.updateHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    await hospital.update(req.body);

    res.status(200).json({
      success: true,
      data: hospital
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete hospital
// @route   DELETE /api/hospitals/:id
// @access  Private (Admin only)
exports.deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByPk(req.params.id);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    await hospital.destroy();

    res.status(200).json({
      success: true,
      message: 'Hospital deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
