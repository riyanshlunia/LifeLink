const { Donor, Organ } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all donors
// @route   GET /api/donors
// @access  Private
exports.getDonors = async (req, res, next) => {
  try {
    const { status, blood_group, city, search } = req.query;
    const where = {};

    if (status) where.donation_status = status;
    if (blood_group) where.blood_group = blood_group;
    if (city) where.city = city;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { contact_number: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const donors = await Donor.findAll({
      where,
      include: [{ model: Organ, as: 'organs' }],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: donors.length,
      data: donors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single donor
// @route   GET /api/donors/:id
// @access  Private
exports.getDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findByPk(req.params.id, {
      include: [
        { model: Organ, as: 'organs' },
        { model: require('./Matching'), as: 'matches' }
      ]
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: donor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new donor
// @route   POST /api/donors
// @access  Private
exports.createDonor = async (req, res, next) => {
  try {
    const donor = await Donor.create(req.body);

    res.status(201).json({
      success: true,
      data: donor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update donor
// @route   PUT /api/donors/:id
// @access  Private
exports.updateDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findByPk(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    await donor.update(req.body);

    res.status(200).json({
      success: true,
      data: donor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete donor
// @route   DELETE /api/donors/:id
// @access  Private (Admin only)
exports.deleteDonor = async (req, res, next) => {
  try {
    const donor = await Donor.findByPk(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found'
      });
    }

    await donor.destroy();

    res.status(200).json({
      success: true,
      message: 'Donor deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get donor statistics
// @route   GET /api/donors/stats
// @access  Private
exports.getDonorStats = async (req, res, next) => {
  try {
    const stats = await Donor.findAll({
      attributes: [
        'donation_status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['donation_status']
    });

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
