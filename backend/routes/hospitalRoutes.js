const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const auditLogger = require('../middleware/auditLogger');
const {
  getHospitals,
  getHospital,
  createHospital,
  updateHospital,
  deleteHospital
} = require('../controllers/hospitalController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getHospitals)
  .post(
    authorize('admin'),
    [
      body('name').notEmpty().withMessage('Hospital name is required'),
      body('address').notEmpty().withMessage('Address is required'),
      body('city').notEmpty().withMessage('City is required'),
      body('state').notEmpty().withMessage('State is required'),
      body('contact_number').notEmpty().withMessage('Contact number is required'),
      body('email').isEmail().withMessage('Valid email is required'),
      validate
    ],
    auditLogger('CREATE', 'Hospital'),
    createHospital
  );

router.route('/:id')
  .get(getHospital)
  .put(
    authorize('admin'),
    auditLogger('UPDATE', 'Hospital'),
    updateHospital
  )
  .delete(
    authorize('admin'),
    auditLogger('DELETE', 'Hospital'),
    deleteHospital
  );

module.exports = router;
