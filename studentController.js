const db = require('../config/database');

// Get all students
exports.getAllStudents = async (req, res) => {
    try {
        const [students] = await db.query(
            `SELECT student_id, roll_number, name, class, section, email, phone
             FROM students
             ORDER BY class, section, roll_number`
        );

        res.json({ 
            success: true, 
            count: students.length,
            students: students 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching students',
            error: error.message 
        });
    }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
    try {
        const { id } = req.params;

        const [students] = await db.query(
            `SELECT s.*, u.username
             FROM students s
             JOIN users u ON s.user_id = u.user_id
             WHERE s.student_id = ?`,
            [id]
        );

        if (students.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found' 
            });
        }

        res.json({ 
            success: true, 
            student: students[0] 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching student',
            error: error.message 
        });
    }
};

// Get students by class
exports.getStudentsByClass = async (req, res) => {
    try {
        const { className } = req.params;

        const [students] = await db.query(
            `SELECT student_id, roll_number, name, class, section, email
             FROM students
             WHERE class = ?
             ORDER BY section, roll_number`,
            [className]
        );

        res.json({ 
            success: true, 
            count: students.length,
            students: students 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching students by class',
            error: error.message 
        });
    }
};

// Add new student
exports.addStudent = async (req, res) => {
    try {
        const { username, password, roll_number, name, className, section, email, phone } = req.body;

        // Insert into users table first
        const [userResult] = await db.query(
            `INSERT INTO users (username, password, role) VALUES (?, ?, 'student')`,
            [username, password]
        );

        const userId = userResult.insertId;

        // Insert into students table
        const [studentResult] = await db.query(
            `INSERT INTO students (user_id, roll_number, name, class, section, email, phone)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, roll_number, name, className, section, email, phone]
        );

        res.status(201).json({ 
            success: true, 
            message: 'Student added successfully',
            student_id: studentResult.insertId 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error adding student',
            error: error.message 
        });
    }
};

// Update student
exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, className, section, email, phone } = req.body;

        await db.query(
            `UPDATE students 
             SET name = ?, class = ?, section = ?, email = ?, phone = ?
             WHERE student_id = ?`,
            [name, className, section, email, phone, id]
        );

        res.json({ 
            success: true, 
            message: 'Student updated successfully' 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error updating student',
            error: error.message 
        });
    }
};

// Delete student
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(`DELETE FROM students WHERE student_id = ?`, [id]);

        res.json({ 
            success: true, 
            message: 'Student deleted successfully' 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting student',
            error: error.message 
        });
    }
};