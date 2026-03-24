const { Organ, Donor, sequelize } = require('../models');

// @desc    Get active organs from View
// @route   GET /api/organs/active
// @access  Private
exports.getActiveOrgans = async (req, res, next) => {
  try {
    const [results, metadata] = await sequelize.query('SELECT * FROM active_organs_view');
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all organs
// @route   GET /api/organs
// @access  Private
exports.getOrgans = async (req, res, next) => {
  try {
    const { organ_type, status, donor_id } = req.query;
    const where = {};

    if (organ_type) where.organ_type = organ_type;
    if (status) where.status = status;
    if (donor_id) where.donor_id = donor_id;

    const organs = await Organ.findAll({
      where,
      include: [{ model: Donor, as: 'donor' }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: organs.length,
      data: organs
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single organ
// @route   GET /api/organs/:id
// @access  Private
exports.getOrgan = async (req, res, next) => {
  try {
    const organ = await Organ.findByPk(req.params.id, {
      include: [{ model: Donor, as: 'donor' }]
    });

    if (!organ) {
      return res.status(404).json({
        success: false,
        message: 'Organ not found'
      });
    }

    res.status(200).json({
      success: true,
      data: organ
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new organ
// @route   POST /api/organs
// @access  Private
exports.createOrgan = async (req, res, next) => {
  try {
    const organ = await Organ.create(req.body);

    res.status(201).json({
      success: true,
      data: organ
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update organ
// @route   PUT /api/organs/:id
// @access  Private
exports.updateOrgan = async (req, res, next) => {
  try {
    const organ = await Organ.findByPk(req.params.id);

    if (!organ) {
      return res.status(404).json({
        success: false,
        message: 'Organ not found'
      });
    }

    await organ.update(req.body);

    res.status(200).json({
      success: true,
      data: organ
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete organ
// @route   DELETE /api/organs/:id
// @access  Private (Admin only)
exports.deleteOrgan = async (req, res, next) => {
  try {
    const organ = await Organ.findByPk(req.params.id);

    if (!organ) {
      return res.status(404).json({
        success: false,
        message: 'Organ not found'
      });
    }

    await organ.destroy();

    res.status(200).json({
      success: true,
      message: 'Organ deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available organs by type
// @route   GET /api/organs/available/:type
// @access  Private
exports.getAvailableOrgansByType = async (req, res, next) => {
  try {
    const organs = await Organ.findAll({
      where: {
        organ_type: req.params.type,
        status: 'Available'
      },
      include: [{ model: Donor, as: 'donor' }]
    });

    res.status(200).json({
      success: true,
      count: organs.length,
      data: organs
    });
  } catch (error) {
    next(error);
  }
};
