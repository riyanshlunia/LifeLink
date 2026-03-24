const { Recipient } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all recipients
// @route   GET /api/recipients
// @access  Private
exports.getRecipients = async (req, res, next) => {
  try {
    const { status, blood_group, urgency_level, required_organ, search } = req.query;
    const where = {};

    if (status) where.status = status;
    if (blood_group) where.blood_group = blood_group;
    if (urgency_level) where.urgency_level = urgency_level;
    if (required_organ) where.required_organ = required_organ;
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { contact_number: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const recipients = await Recipient.findAll({
      where,
      order: [
        ['urgency_level', 'ASC'], // Critical first
        ['waiting_since', 'ASC']  // Longest waiting first
      ]
    });

    res.status(200).json({
      success: true,
      count: recipients.length,
      data: recipients
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single recipient
// @route   GET /api/recipients/:id
// @access  Private
exports.getRecipient = async (req, res, next) => {
  try {
    const recipient = await Recipient.findByPk(req.params.id, {
      include: [{ association: 'matches' }]
    });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: recipient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new recipient
// @route   POST /api/recipients
// @access  Private
exports.createRecipient = async (req, res, next) => {
  try {
    const recipient = await Recipient.create(req.body);

    res.status(201).json({
      success: true,
      data: recipient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update recipient
// @route   PUT /api/recipients/:id
// @access  Private
exports.updateRecipient = async (req, res, next) => {
  try {
    const recipient = await Recipient.findByPk(req.params.id);

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    await recipient.update(req.body);

    res.status(200).json({
      success: true,
      data: recipient
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete recipient
// @route   DELETE /api/recipients/:id
// @access  Private (Admin only)
exports.deleteRecipient = async (req, res, next) => {
  try {
    const recipient = await Recipient.findByPk(req.params.id);

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    await recipient.destroy();

    res.status(200).json({
      success: true,
      message: 'Recipient deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get waiting list (prioritized)
// @route   GET /api/recipients/waiting-list
// @access  Private
exports.getWaitingList = async (req, res, next) => {
  try {
    const waitingList = await Recipient.findAll({
      where: { status: 'waiting' },
      order: [
        [sequelize.literal("CASE urgency_level WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END"), 'ASC'],
        ['waiting_since', 'ASC']
      ]
    });

    res.status(200).json({
      success: true,
      count: waitingList.length,
      data: waitingList
    });
  } catch (error) {
    next(error);
  }
};
