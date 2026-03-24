const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auditLogger = require('../middleware/auditLogger');
const {
  getDonors,
  getDonor,
  createDonor,
  updateDonor,
  deleteDonor
} = require('../controllers/donorController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getDonors)
  .post(
    authorize('admin', 'hospital_staff'),
    [
      body('full_name').notEmpty().withMessage('Full name is required'),
      body('date_of_birth').isDate().withMessage('Valid date of birth is required'),
      body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
      body('blood_group').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
      body('contact_number').notEmpty().withMessage('Contact number is required'),
      body('address').notEmpty().withMessage('Address is required'),
      body('city').notEmpty().withMessage('City is required'),
      body('state').notEmpty().withMessage('State is required'),
      validate
    ],
    auditLogger('CREATE', 'Donor'),
    createDonor
  );

router.route('/:id')
  .get(getDonor)
  .put(
    authorize('admin', 'hospital_staff'),
    auditLogger('UPDATE', 'Donor'),
    updateDonor
  )
  .delete(
    authorize('admin'),
    auditLogger('DELETE', 'Donor'),
    deleteDonor
  );

module.exports = router;
