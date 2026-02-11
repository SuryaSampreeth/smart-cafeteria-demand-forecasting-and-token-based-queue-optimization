const express = require('express');
const router = express.Router();
const { registerStudent, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

/*
 * Routes for user authentication.
 * Includes registration for students and login for all users.
 */

// Route to register a new student
router.post('/register', registerStudent);

// Route for user login for student, staff and admin
router.post('/login', login);

// Route to get the current logged-in user details
router.get('/me', protect, getMe);

module.exports = router;
