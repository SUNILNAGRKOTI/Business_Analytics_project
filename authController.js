const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login function
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username and password are required' 
            });
        }

        // SQL Query: Check if user exists and get their details
        const [users] = await db.query(
            `SELECT u.user_id, u.username, u.role, u.password,
                    t.teacher_id, t.name as teacher_name,
                    s.student_id, s.name as student_name,
                    tp.can_add_marks, tp.can_edit_marks, tp.can_delete_marks, tp.can_view_all_students
             FROM users u
             LEFT JOIN teachers t ON u.user_id = t.user_id
             LEFT JOIN students s ON u.user_id = s.user_id
             LEFT JOIN teacher_permissions tp ON t.teacher_id = tp.teacher_id
             WHERE u.username = ?`,
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }

        const user = users[0];

        // Check password (plain text for now)
        if (password !== user.password) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid username or password' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                user_id: user.user_id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Prepare response based on role
        let responseData = {
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                user_id: user.user_id,
                username: user.username,
                role: user.role
            }
        };

        // Add role-specific data
        if (user.role === 'teacher') {
            responseData.user.teacher_id = user.teacher_id;
            responseData.user.name = user.teacher_name;
            responseData.user.permissions = {
                can_add_marks: user.can_add_marks,
                can_edit_marks: user.can_edit_marks,
                can_delete_marks: user.can_delete_marks,
                can_view_all_students: user.can_view_all_students
            };
        } else if (user.role === 'student') {
            responseData.user.student_id = user.student_id;
            responseData.user.name = user.student_name;
        }

        res.json(responseData);

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login',
            error: error.message 
        });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [users] = await db.query(
            `SELECT u.user_id, u.username, u.role,
                    t.teacher_id, t.name as teacher_name, t.subject, t.email,
                    s.student_id, s.name as student_name, s.roll_number, s.class, s.section
             FROM users u
             LEFT JOIN teachers t ON u.user_id = t.user_id
             LEFT JOIN students s ON u.user_id = s.user_id
             WHERE u.user_id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        res.json({ 
            success: true, 
            user: users[0] 
        });

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching profile',
            error: error.message 
        });
    }
};