const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Report = require('../models/Report');

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalConversations = await Conversation.countDocuments();
    const totalMessages = await Message.countDocuments();
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    // Active in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const activeUsersToday = await User.countDocuments({
      lastSeen: { $gte: oneDayAgo },
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalConversations,
        totalMessages,
        activeUsersToday,
        blockedUsers,
        pendingReports,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users for admin management
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAdminUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query = {
        $or: [{ name: regex }, { username: regex }, { email: regex }],
      };
    }

    const users = await User.find(query)
      .select('name username email profileImage status onlineStatus lastSeen role isBlocked createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle block/unblock user
// @route   PUT /api/admin/users/:id/toggle-block
// @access  Private (Admin only)
const toggleBlockUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot ban their own account.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot ban another administrator.',
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `User has been ${user.isBlocked ? 'suspended' : 're-activated'}.`,
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get moderation reports
// @route   GET /api/admin/reports
// @access  Private (Admin only)
const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'name username email')
      .populate('reportedUser', 'name username email isBlocked')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemStats,
  getAdminUsers,
  toggleBlockUser,
  getReports,
};
