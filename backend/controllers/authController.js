const jwt = require('jsonwebtoken');
const User = require('../models/User');

/*
 * This function is used to generate a JWT token for a user.
 * The user ID is stored inside the token payload.
 * The token is signed using a secret key from environment variables.
 * Token is valid for 30 minutes.
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30min', // Token validity set to 30 min

    });
};

/*
 * This function is used to register a new student.
 * It creates a student account and returns a JWT token.
 * This API is open and does not require authentication.
 */
const registerStudent = async (req, res) => {
    try {
        // Get student details from request body
        const { name, email, password, registrationNumber } = req.body;

        // Check if a user with this email already exists in the database
        // This prevents duplicate accounts
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new student user
        // password encryption is handled in the User model
        const user = await User.create({
            name,
            email,
            password,
            registrationNumber,
            role: 'student', //student role is set as default
        });

        if (user) {
            // send user detials along with JWT token
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                registrationNumber: user.registrationNumber,
                token: generateToken(user._id), // Send token for immediate login
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/*
 * This function is used for user login.
 * It checks email and password and returns a token if valid.
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        // Password is explicitly selected for verification
        const user = await User.findOne({ email }).select('+password');

        // Verify user exists AND password matches
        // comparePassword is a custom method defined in the User model using bcrypt
        if (user && (await user.comparePassword(password))) {
            // If authentication successful, return user data and a fresh token
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                registrationNumber: user.registrationNumber,
                token: generateToken(user._id),
            });
        } else {
            // Return 401 Unauthorized if credentials are invalid
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/*
 * This function returns the details of the currently logged-in user.
 * It requires a valid JWT token.
 */
const getMe = async (req, res) => {
    try {
        //user ID is obtained from req.user set by auth middleware
        const user = await User.findById(req.user._id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerStudent,
    login,
    getMe,
};
