const User = require('../models/User');
const { generateToken } = require('../utils/token');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, username, email, password, profileImage } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, username, email, password.',
      });
    }

    // Check if user or email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken. Please pick another.',
      });
    }

    // Default avatar if none provided
    const avatarUrl =
      profileImage ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;

    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
      profileImage: avatarUrl,
      status: 'Hey there! I am using CONNECTX.',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        status: user.status,
        onlineStatus: user.onlineStatus,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { loginId, email, password } = req.body;
    const identifier = (loginId || email || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email/username and password.',
      });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your username/email and password.',
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact an administrator.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your username/email and password.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        status: user.status,
        onlineStatus: user.onlineStatus,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        status: user.status,
        onlineStatus: user.onlineStatus,
        lastSeen: user.lastSeen,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, status, profileImage, onlineStatus } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (name) user.name = name.trim();
    if (status !== undefined) user.status = status.trim();
    if (profileImage) user.profileImage = profileImage;
    if (onlineStatus && ['online', 'offline', 'away', 'busy'].includes(onlineStatus)) {
      user.onlineStatus = onlineStatus;
    }

    // Handle file upload if attached
    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profileImage: user.profileImage,
        status: user.status,
        onlineStatus: user.onlineStatus,
        lastSeen: user.lastSeen,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters.',
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully!',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};
