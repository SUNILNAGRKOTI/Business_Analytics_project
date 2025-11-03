const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const db = require('../config/database');

// Get all teacher permissions
router.get('/', verifyToken, isAdmin, async (req, res) => {
    try {
        const [permissions] = await db.query(
            `SELECT tp.*, t.name as teacher_name, t.subject
             FROM teacher_permissions tp
             JOIN teachers t ON tp.teacher_id = t.teacher_id`
        );

        res.json({ 
            success: true, 
            permissions: permissions 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching permissions',
            error: error.message 
        });
    }
});

// Update teacher permissions (Grant/Revoke)
router.put('/:teacherId', verifyToken, isAdmin, async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { can_add_marks, can_edit_marks, can_delete_marks, can_view_all_students } = req.body;

        await db.query(
            `UPDATE teacher_permissions 
             SET can_add_marks = ?, can_edit_marks = ?, can_delete_marks = ?, can_view_all_students = ?
             WHERE teacher_id = ?`,
            [can_add_marks, can_edit_marks, can_delete_marks, can_view_all_students, teacherId]
        );

        res.json({ 
            success: true, 
            message: 'Permissions updated successfully' 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating permissions',
            error: error.message 
        });
    }
});

module.exports = router;