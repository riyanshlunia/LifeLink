const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auditLogger = require('../middleware/auditLogger');
const {
  getMatchings,
  getMatching,
  findMatches,
  approveMatching,
  deleteMatching,
  runAutomatedMatching
} = require('../controllers/matchingController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/run-automated', 
  authorize('admin'),
  auditLogger('RUN_AUTOMATED_MATCHING', 'Matching'),
  runAutomatedMatching
);

router.post('/find-matches/:recipientId', 
  authorize('admin', 'hospital_staff'),
  auditLogger('FIND_MATCHES', 'Matching'),
  findMatches
);

router.put('/:id/approve', 
  authorize('admin'),
  [
    body('approval_status').isIn(['approved', 'rejected']).withMessage('Invalid approval status'),
    validate
  ],
  auditLogger('APPROVE_MATCHING', 'Matching'),
  approveMatching
);

router.route('/')
  .get(getMatchings);

router.route('/:id')
  .get(getMatching)
  .delete(
    authorize('admin'),
    auditLogger('DELETE', 'Matching'),
    deleteMatching
  );

module.exports = router;
