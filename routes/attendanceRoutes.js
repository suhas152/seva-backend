const express = require('express');
const router = express.Router();
const { markAttendance, getMyAttendance, getAttendanceStats } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('student'), markAttendance);
router.get('/my', protect, authorize('student'), getMyAttendance);
router.get('/stats', protect, authorize('admin', 'cook'), getAttendanceStats);

module.exports = router;
