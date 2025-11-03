const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Login route (public)
router.post('/login', authController.login);

// Get profile (protected)
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;