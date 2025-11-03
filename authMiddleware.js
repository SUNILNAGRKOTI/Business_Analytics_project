const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Verify JWT token
exports.verifyToken = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided. Access denied.' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get full user details from database
        const [users] = await db.query(
            `SELECT u.user_id, u.username, u.role,
                    t.teacher_id, s.student_id
             FROM users u
             LEFT JOIN teachers t ON u.user_id = t.user_id
             LEFT JOIN students s ON u.user_id = s.user_id
             WHERE u.user_id = ?`,
            [decoded.user_id]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Attach user to request
        req.user = users[0];
        next();

    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired token',
            error: error.message 
        });
    }
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Access denied. Admin only.' 
        });
    }
    next();
};

// Check if user is teacher
exports.isTeacher = (req, res, next) => {
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Access denied. Teacher only.' 
        });
    }
    next();
};

// Check if user is student
exports.isStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({ 
            success: false, 
            message: 'Access denied. Student only.' 
        });
    }
    next();
};