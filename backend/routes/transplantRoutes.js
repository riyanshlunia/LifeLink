const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auditLogger = require('../middleware/auditLogger');
const {
  getTransplants,
  getTransplant,
  createTransplant,
  updateTransplant,
  deleteTransplant
} = require('../controllers/transplantController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getTransplants)
  .post(
    authorize('admin', 'hospital_staff', 'doctor'),
    [
      body('matching_id').isInt().withMessage('Valid matching ID is required'),
      body('hospital_id').isInt().withMessage('Valid hospital ID is required'),
      body('doctor_id').isInt().withMessage('Valid doctor ID is required'),
      body('transplant_date').isISO8601().withMessage('Valid transplant date is required'),
      validate
    ],
    auditLogger('CREATE', 'TransplantRecord'),
    createTransplant
  );

router.route('/:id')
  .get(getTransplant)
  .put(
    authorize('admin', 'hospital_staff', 'doctor'),
    auditLogger('UPDATE', 'TransplantRecord'),
    updateTransplant
  )
  .delete(
    authorize('admin'),
    auditLogger('DELETE', 'TransplantRecord'),
    deleteTransplant
  );

module.exports = router;
