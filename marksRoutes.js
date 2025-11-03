const express = require('express');
const router = express.Router();
const marksController = require('../controllers/marksController');
const { verifyToken, isTeacher } = require('../middleware/authMiddleware');

// Get marks for a student
router.get('/student/:studentId', verifyToken, marksController.getStudentMarks);

// Get subject-wise performance
router.get('/student/:studentId/subject-wise', verifyToken, marksController.getSubjectWisePerformance);

// Get class performance (Teacher only)
router.get('/class/:className/performance', verifyToken, isTeacher, marksController.getClassPerformance);

// Add marks (Teacher only)
router.post('/', verifyToken, isTeacher, marksController.addMarks);

// Update marks (Teacher only)
router.put('/:id', verifyToken, isTeacher, marksController.updateMarks);

// Delete marks (Teacher only)
router.delete('/:id', verifyToken, isTeacher, marksController.deleteMarks);

module.exports = router;