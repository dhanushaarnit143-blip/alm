// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to sign JWT
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_12345!',
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

// @desc    Register new user (alumni/admin)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      graduationYear,
      degree,
      currentCompany,
      jobTitle,
      location,
      bio,
      profilePic,
      linkedinUrl,
      role
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: role && ['admin', 'alumni'].includes(role) ? role : 'alumni',
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      degree: degree || '',
      currentCompany: currentCompany || '',
      jobTitle: jobTitle || '',
      location: location || '',
      bio: bio || '',
      profilePic: profilePic || undefined,
      linkedinUrl: linkedinUrl || ''
    });

    const token = generateToken(user._id);

    // Return response without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      graduationYear: user.graduationYear,
      degree: user.degree,
      currentCompany: user.currentCompany,
      jobTitle: user.jobTitle,
      location: user.location,
      bio: user.bio,
      profilePic: user.profilePic,
      linkedinUrl: user.linkedinUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user with password field explicitly selected
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      graduationYear: user.graduationYear,
      degree: user.degree,
      currentCompany: user.currentCompany,
      jobTitle: user.jobTitle,
      location: user.location,
      bio: user.bio,
      profilePic: user.profilePic,
      linkedinUrl: user.linkedinUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(200).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Protected
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
