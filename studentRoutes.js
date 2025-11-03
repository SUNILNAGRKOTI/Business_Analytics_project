const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { verifyToken, isTeacher, isAdmin } = require('../middleware/authMiddleware');

// Get all students (Teacher/Admin only)
router.get('/', verifyToken, isTeacher, studentController.getAllStudents);

// Get students by class
router.get('/class/:className', verifyToken, isTeacher, studentController.getStudentsByClass);

// Get student by ID
router.get('/:id', verifyToken, studentController.getStudentById);

// Add new student (Admin only)
router.post('/', verifyToken, isAdmin, studentController.addStudent);

// Update student (Admin only)
router.put('/:id', verifyToken, isAdmin, studentController.updateStudent);

// Delete student (Admin only)
router.delete('/:id', verifyToken, isAdmin, studentController.deleteStudent);

module.exports = router;