const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auditLogger = require('../middleware/auditLogger');
const {
  getRecipients,
  getRecipient,
  createRecipient,
  updateRecipient,
  deleteRecipient,
  getWaitingList
} = require('../controllers/recipientController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/waiting-list', getWaitingList);

router.route('/')
  .get(getRecipients)
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
      body('medical_condition').notEmpty().withMessage('Medical condition is required'),
      body('required_organ').isIn(['heart', 'kidney', 'liver', 'lung', 'pancreas', 'intestine', 'cornea']).withMessage('Invalid organ type'),
      body('urgency_level').isIn(['critical', 'high', 'medium', 'low']).withMessage('Invalid urgency level'),
      validate
    ],
    auditLogger('CREATE', 'Recipient'),
    createRecipient
  );

router.route('/:id')
  .get(getRecipient)
  .put(
    authorize('admin', 'hospital_staff'),
    auditLogger('UPDATE', 'Recipient'),
    updateRecipient
  )
  .delete(
    authorize('admin'),
    auditLogger('DELETE', 'Recipient'),
    deleteRecipient
  );

module.exports = router;
