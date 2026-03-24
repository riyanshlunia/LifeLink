const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auditLogger = require('../middleware/auditLogger');
const {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getDoctors)
  .post(
    authorize('admin', 'hospital_staff'),
    [
      body('hospital_id').isInt().withMessage('Valid hospital ID is required'),
      body('full_name').notEmpty().withMessage('Full name is required'),
      body('specialization').notEmpty().withMessage('Specialization is required'),
      body('license_number').notEmpty().withMessage('License number is required'),
      body('contact_number').notEmpty().withMessage('Contact number is required'),
      body('email').isEmail().withMessage('Valid email is required'),
      body('experience_years').isInt({ min: 0 }).withMessage('Valid experience years required'),
      validate
    ],
    auditLogger('CREATE', 'Doctor'),
    createDoctor
  );

router.route('/:id')
  .get(getDoctor)
  .put(
    authorize('admin', 'hospital_staff'),
    auditLogger('UPDATE', 'Doctor'),
    updateDoctor
  )
  .delete(
    authorize('admin'),
    auditLogger('DELETE', 'Doctor'),
    deleteDoctor
  );

module.exports = router;
