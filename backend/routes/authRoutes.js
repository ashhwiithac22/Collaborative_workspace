const express = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Use Express Router instead of the 'router' package
const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected route
router.get('/profile', auth, getProfile);

module.exports = router;