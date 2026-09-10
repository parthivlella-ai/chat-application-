const User = require('../models/User');

// @desc    Get all users (excluding current user, with optional search)
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const currentUserId = req.user._id;

    let query = {
      _id: { $ne: currentUserId },
      isBlocked: { $ne: true },
    };

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { username: searchRegex },
        { email: searchRegex },
      ];
    }

    const users = await User.find(query)
      .select('name username email profileImage status onlineStatus lastSeen role createdAt')
      .sort({ name: 1 })
      .limit(50);

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user details by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name username email profileImage status onlineStatus lastSeen role createdAt'
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile by ID
// @route   PUT /api/users/:id
// @access  Private
const updateUser = async (req, res, next) => {
  try {
    // Only permit updating own profile unless admin
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this profile.',
      });
    }

    const { name, status, profileImage, onlineStatus } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (status !== undefined) updateData.status = status;
    if (profileImage) updateData.profileImage = profileImage;
    if (onlineStatus) updateData.onlineStatus = onlineStatus;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({
      success: true,
      message: 'User profile updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
};
