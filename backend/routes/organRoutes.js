const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auditLogger = require('../middleware/auditLogger');
const {
  getOrgans,
  getOrgan,
  createOrgan,
  updateOrgan,
  deleteOrgan,
  getAvailableOrgansByType,
  getActiveOrgans
} = require('../controllers/organController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/active', getActiveOrgans);
router.get('/available/:type', getAvailableOrgansByType);

router.route('/')
  .get(getOrgans)
  .post(
    authorize('admin', 'hospital_staff'),
    [
      body('donor_id').isInt().withMessage('Valid donor ID is required'),
      body('organ_type').isIn(['heart', 'kidney', 'liver', 'lung', 'pancreas', 'intestine', 'cornea']).withMessage('Invalid organ type'),
      validate
    ],
    auditLogger('CREATE', 'Organ'),
    createOrgan
  );

router.route('/:id')
  .get(getOrgan)
  .put(
    authorize('admin', 'hospital_staff'),
    auditLogger('UPDATE', 'Organ'),
    updateOrgan
  )
  .delete(
    authorize('admin'),
    auditLogger('DELETE', 'Organ'),
    deleteOrgan
  );

module.exports = router;
