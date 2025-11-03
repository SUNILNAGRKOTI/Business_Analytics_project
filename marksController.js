const db = require('../config/database');

// Get all marks for a student
exports.getStudentMarks = async (req, res) => {
    try {
        const { studentId } = req.params;

        const [marks] = await db.query(
            `SELECT m.mark_id, m.marks_obtained, m.exam_type, m.exam_date,
                    sub.subject_name, sub.max_marks,
                    t.name as teacher_name,
                    ROUND((m.marks_obtained / sub.max_marks) * 100, 2) as percentage
             FROM marks m
             JOIN subjects sub ON m.subject_id = sub.subject_id
             LEFT JOIN teachers t ON m.teacher_id = t.teacher_id
             WHERE m.student_id = ?
             ORDER BY m.exam_date DESC`,
            [studentId]
        );

        res.json({ 
            success: true, 
            count: marks.length,
            marks: marks 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching marks',
            error: error.message 
        });
    }
};

// Get subject-wise performance for a student
exports.getSubjectWisePerformance = async (req, res) => {
    try {
        const { studentId } = req.params;

        const [performance] = await db.query(
            `SELECT sub.subject_name,
                    AVG(m.marks_obtained) as avg_marks,
                    MAX(m.marks_obtained) as max_marks,
                    MIN(m.marks_obtained) as min_marks,
                    COUNT(m.mark_id) as total_exams,
                    sub.max_marks as subject_max_marks,
                    ROUND(AVG((m.marks_obtained / sub.max_marks) * 100), 2) as avg_percentage
             FROM marks m
             JOIN subjects sub ON m.subject_id = sub.subject_id
             WHERE m.student_id = ?
             GROUP BY sub.subject_id, sub.subject_name, sub.max_marks`,
            [studentId]
        );

        res.json({ 
            success: true, 
            performance: performance 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching performance',
            error: error.message 
        });
    }
};

// Add marks (Teacher only - check permissions)
exports.addMarks = async (req, res) => {
    try {
        const { student_id, subject_id, exam_type, marks_obtained, exam_date } = req.body;
        const teacher_id = req.user.teacher_id; // From JWT token

        // Check if teacher has permission
        const [permissions] = await db.query(
            `SELECT can_add_marks FROM teacher_permissions WHERE teacher_id = ?`,
            [teacher_id]
        );

        if (!permissions[0] || !permissions[0].can_add_marks) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to add marks' 
            });
        }

        // Insert marks
        const [result] = await db.query(
            `INSERT INTO marks (student_id, subject_id, exam_type, marks_obtained, exam_date, teacher_id)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [student_id, subject_id, exam_type, marks_obtained, exam_date, teacher_id]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Marks added successfully',
            mark_id: result.insertId 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error adding marks',
            error: error.message 
        });
    }
};

// Update marks (Teacher only - check permissions)
exports.updateMarks = async (req, res) => {
    try {
        const { id } = req.params;
        const { marks_obtained } = req.body;
        const teacher_id = req.user.teacher_id;

        // Check permission
        const [permissions] = await db.query(
            `SELECT can_edit_marks FROM teacher_permissions WHERE teacher_id = ?`,
            [teacher_id]
        );

        if (!permissions[0] || !permissions[0].can_edit_marks) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to edit marks' 
            });
        }

        await db.query(
            `UPDATE marks SET marks_obtained = ? WHERE mark_id = ?`,
            [marks_obtained, id]
        );

        res.json({ 
            success: true, 
            message: 'Marks updated successfully' 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating marks',
            error: error.message 
        });
    }
};

// Delete marks (Admin/Teacher with permission)
exports.deleteMarks = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher_id = req.user.teacher_id;

        // Check permission
        const [permissions] = await db.query(
            `SELECT can_delete_marks FROM teacher_permissions WHERE teacher_id = ?`,
            [teacher_id]
        );

        if (!permissions[0] || !permissions[0].can_delete_marks) {
            return res.status(403).json({ 
                success: false, 
                message: 'You do not have permission to delete marks' 
            });
        }

        await db.query(`DELETE FROM marks WHERE mark_id = ?`, [id]);

        res.json({ 
            success: true, 
            message: 'Marks deleted successfully' 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting marks',
            error: error.message 
        });
    }
};

// Get class performance (for teachers)
exports.getClassPerformance = async (req, res) => {
    try {
        const { className } = req.params;

        const [performance] = await db.query(
            `SELECT s.student_id, s.roll_number, s.name,
                    AVG(m.marks_obtained) as avg_marks,
                    ROUND(AVG((m.marks_obtained / sub.max_marks) * 100), 2) as avg_percentage
             FROM students s
             LEFT JOIN marks m ON s.student_id = m.student_id
             LEFT JOIN subjects sub ON m.subject_id = sub.subject_id
             WHERE s.class = ?
             GROUP BY s.student_id, s.roll_number, s.name
             ORDER BY avg_percentage DESC`,
            [className]
        );

        res.json({ 
            success: true, 
            performance: performance 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching class performance',
            error: error.message 
        });
    }
};