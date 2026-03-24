const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getHospitalDashboard,
  getDoctorDashboard,
  getParticipants
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/participants', authorize('admin', 'hospital_staff'), getParticipants);
router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/hospital/:hospitalId', authorize('admin', 'hospital_staff'), getHospitalDashboard);
router.get('/doctor/:doctorId', authorize('admin', 'hospital_staff', 'doctor'), getDoctorDashboard);

module.exports = router;
