const { Matching, Donor, Recipient, Organ, sequelize } = require('../models');
const { calculateCompatibility } = require('../utils/matchingAlgorithm');

// @desc    Run automated matching algorithm (Stored Procedure)
// @route   POST /api/matchings/run-automated
// @access  Private (Admin)
exports.runAutomatedMatching = async (req, res, next) => {
  try {
    // Call the stored procedure
    await sequelize.query('CALL run_matching_algorithm()');

    res.status(200).json({
      success: true,
      message: 'Automated matching process completed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all matchings
// @route   GET /api/matchings
// @access  Private
exports.getMatchings = async (req, res, next) => {
  try {
    const { approval_status, compatibility_status } = req.query;
    const where = {};

    if (approval_status) where.approval_status = approval_status;
    if (compatibility_status) where.compatibility_status = compatibility_status;

    const matchings = await Matching.findAll({
      where,
      include: [
        { model: Donor, as: 'donor' },
        { model: Recipient, as: 'recipient' },
        { model: Organ, as: 'organ' }
      ],
      order: [
        ['compatibility_score', 'DESC'],
        ['match_date', 'DESC']
      ]
    });

    res.status(200).json({
      success: true,
      count: matchings.length,
      data: matchings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single matching
// @route   GET /api/matchings/:id
// @access  Private
exports.getMatching = async (req, res, next) => {
  try {
    const matching = await Matching.findByPk(req.params.id, {
      include: [
        { model: Donor, as: 'donor' },
        { model: Recipient, as: 'recipient' },
        { model: Organ, as: 'organ' },
        { association: 'transplant' }
      ]
    });

    if (!matching) {
      return res.status(404).json({
        success: false,
        message: 'Matching not found'
      });
    }

    res.status(200).json({
      success: true,
      data: matching
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create potential matches for a recipient
// @route   POST /api/matchings/find-matches/:recipientId
// @access  Private
exports.findMatches = async (req, res, next) => {
  try {
    const recipient = await Recipient.findByPk(req.params.recipientId);

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    if (recipient.status !== 'waiting') {
      return res.status(400).json({
        success: false,
        message: 'Recipient is not in waiting status'
      });
    }

    // Find available organs of the required type
    const organs = await Organ.findAll({
      where: {
        organ_type: recipient.required_organ,
        status: 'Available'
      },
      include: [{ model: Donor, as: 'donor' }]
    });

    const potentialMatches = [];

    for (const organ of organs) {
      const { score, status } = calculateCompatibility(
        organ.donor,
        recipient,
        organ
      );

      if (status !== 'incompatible') {
        potentialMatches.push({
          donor_id: organ.donor_id,
          recipient_id: recipient.id,
          organ_id: organ.id,
          compatibility_score: score,
          compatibility_status: status,
          approval_status: 'pending'
        });
      }
    }

    // Create matching records
    const createdMatches = await Matching.bulkCreate(potentialMatches);

    res.status(201).json({
      success: true,
      count: createdMatches.length,
      data: createdMatches
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject matching
// @route   PUT /api/matchings/:id/approve
// @access  Private (Admin only)
exports.approveMatching = async (req, res, next) => {
  try {
    const { approval_status, notes } = req.body;

    const matching = await Matching.findByPk(req.params.id);

    if (!matching) {
      return res.status(404).json({
        success: false,
        message: 'Matching not found'
      });
    }

    if (approval_status === 'approved') {
      // Update donor, recipient, and organ statuses
      await Donor.update(
        { donation_status: 'matched' },
        { where: { id: matching.donor_id } }
      );

      await Recipient.update(
        { status: 'matched' },
        { where: { id: matching.recipient_id } }
      );

      await Organ.update(
        { status: 'In Transit' },
        { where: { id: matching.organ_id } }
      );
    }

    await matching.update({
      approval_status,
      approved_by: req.user.id,
      approval_date: new Date(),
      notes
    });

    res.status(200).json({
      success: true,
      data: matching
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete matching
// @route   DELETE /api/matchings/:id
// @access  Private (Admin only)
exports.deleteMatching = async (req, res, next) => {
  try {
    const matching = await Matching.findByPk(req.params.id);

    if (!matching) {
      return res.status(404).json({
        success: false,
        message: 'Matching not found'
      });
    }

    await matching.destroy();

    res.status(200).json({
      success: true,
      message: 'Matching deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
