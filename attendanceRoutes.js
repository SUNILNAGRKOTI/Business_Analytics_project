const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, isTeacher } = require('../middleware/authMiddleware');

// Get attendance for a student
router.get('/student/:studentId', verifyToken, attendanceController.getStudentAttendance);

// Get class attendance for a date (Teacher only)
router.get('/class/:className/date/:date', verifyToken, isTeacher, attendanceController.getClassAttendance);

// Mark attendance (Teacher only)
router.post('/', verifyToken, isTeacher, attendanceController.markAttendance);

module.exports = router;