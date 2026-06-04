const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isDev = process.env.NODE_ENV !== 'production';

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and role',
      });
    }

    const validRoles = ['student', 'trainer', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role selected',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: isDev
          ? `No user found with email: ${email}. Run "node seed.js" to create demo users.`
          : 'Invalid credentials',
      });
    }

    // Check role matches
    if (user.role !== role) {
      return res.status(401).json({
        success: false,
        message: isDev
          ? `Role mismatch: user "${email}" has role "${user.role}" but you selected "${role}"`
          : 'Invalid credentials',
      });
    }

    // Check account active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated',
      });
    }

    // Check password
    const isMatch = await User.matchPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: isDev
          ? 'Password does not match. Check your password or re-run "node seed.js".'
          : 'Invalid credentials',
      });
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error', detail: error.message });
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Dev helper — list all users (emails + roles, no passwords)
// @route   GET /api/auth/debug-users
// @access  Dev only
const debugUsers = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ message: 'Not found' });
  }
  try {
    const users = await User.find();
    res.json({
      count: users.length,
      users: users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, is_active: u.is_active })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login, getMe, debugUsers };
