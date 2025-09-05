// SIMPLIFIED VERSION FOR DEBUGGING
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Register new user - DEBUG VERSION
exports.register = async (req, res) => {
  try {
    console.log('=== REGISTER ENDPOINT ===');
    console.log('Request body:', req.body);
    console.log('Body type:', typeof req.body);
    console.log('=========================');
    
    // If body is empty, return specific error
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        message: 'Empty request body received',
        debug: 'Check if Content-Type: application/json is set and body contains valid JSON'
      });
    }
    
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'All fields are required',
        received: { name, email, password }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ name, email, password });
    await user.save();
    console.log('User saved successfully:', user.email);

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password) and token
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Registration error details:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      error: error.message 
    });
  }
};

// Login user - DEBUG VERSION
exports.login = async (req, res) => {
  try {
    console.log('=== LOGIN ENDPOINT ===');
    console.log('Request body:', req.body);
    console.log('=========================');
    
    // If body is empty, return specific error
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ 
        message: 'Empty request body received',
        debug: 'Check if Content-Type: application/json is set and body contains valid JSON'
      });
    }
    
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);
    console.log('Login successful for:', user.email);

    // Return user data and token
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Login error details:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: error.message 
    });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};