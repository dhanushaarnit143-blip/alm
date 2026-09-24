// backend/controllers/userController.js
const User = require('../models/User');

// @desc    Get all users (Alumni Directory) with search and filters
// @route   GET /api/users
// @access  Protected
const getUsers = async (req, res, next) => {
  try {
    const { year, company, search } = req.query;
    const query = {};

    // Filter by graduation year
    if (year) {
      const parsedYear = parseInt(year, 10);
      if (!isNaN(parsedYear)) {
        query.graduationYear = parsedYear;
      }
    }

    // Filter by company
    if (company && company.trim()) {
      query.currentCompany = { $regex: company.trim(), $options: 'i' };
    }

    // Search query across name, currentCompany, jobTitle, degree, location
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { currentCompany: searchRegex },
        { jobTitle: searchRegex },
        { degree: searchRegex },
        { location: searchRegex }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Protected
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Alumni member not found'
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

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Protected (Owner or Admin only)
const updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Ensure logged in user is either the profile owner or an admin
    const isOwner = req.user._id.toString() === user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only edit your own profile'
      });
    }

    // Allowed fields for update
    const allowedFields = [
      'name',
      'graduationYear',
      'degree',
      'currentCompany',
      'jobTitle',
      'location',
      'bio',
      'profilePic',
      'linkedinUrl'
    ];

    // Admins can also update role
    if (isAdmin && req.body.role) {
      allowedFields.push('role');
    }

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'graduationYear') {
          updates[field] = req.body[field] ? Number(req.body[field]) : undefined;
        } else {
          updates[field] = req.body[field];
        }
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser
};
