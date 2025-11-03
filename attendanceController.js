const db = require('../config/database');

// Get attendance for a student
exports.getStudentAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { startDate, endDate } = req.query;

        let query = `SELECT * FROM attendance WHERE student_id = ?`;
        let params = [studentId];

        if (startDate && endDate) {
            query += ` AND date BETWEEN ? AND ?`;
            params.push(startDate, endDate);
        }

        query += ` ORDER BY date DESC`;

        const [attendance] = await db.query(query, params);

        // Calculate attendance percentage
        const totalDays = attendance.length;
        const presentDays = attendance.filter(a => a.status === 'Present').length;
        const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

        res.json({ 
            success: true, 
            totalDays,
            presentDays,
            attendance_percentage: percentage,
            attendance: attendance 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching attendance',
            error: error.message 
        });
    }
};

// Mark attendance (Teacher only)
exports.markAttendance = async (req, res) => {
    try {
        const { student_id, date, status } = req.body;
        const teacher_id = req.user.teacher_id;

        const [result] = await db.query(
            `INSERT INTO attendance (student_id, date, status, marked_by)
             VALUES (?, ?, ?, ?)`,
            [student_id, date, status, teacher_id]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Attendance marked successfully',
            attendance_id: result.insertId 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error marking attendance',
            error: error.message 
        });
    }
};

// Get class attendance for a date
exports.getClassAttendance = async (req, res) => {
    try {
        const { className, date } = req.params;

        const [attendance] = await db.query(
            `SELECT s.student_id, s.roll_number, s.name, 
                    a.status, a.date
             FROM students s
             LEFT JOIN attendance a ON s.student_id = a.student_id AND a.date = ?
             WHERE s.class = ?
             ORDER BY s.roll_number`,
            [date, className]
        );

        res.json({ 
            success: true, 
            attendance: attendance 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching class attendance',
            error: error.message 
        });
    }
};