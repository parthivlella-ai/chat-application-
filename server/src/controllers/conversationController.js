const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Get all conversations for logged in user
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;

    const conversations = await Conversation.find({
      participants: currentUserId,
    })
      .populate('participants', 'name username email profileImage status onlineStatus lastSeen')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name username profileImage',
        },
      })
      .sort({ updatedAt: -1 });

    // Calculate unread count for the current user for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const convObj = conv.toObject();
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          sender: { $ne: currentUserId },
          readBy: { $ne: currentUserId },
          isDeleted: { $ne: true },
        });
        convObj.unreadCount = unreadCount;
        return convObj;
      })
    );

    res.json({
      success: true,
      conversations: conversationsWithUnread,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or get existing 1-on-1 conversation with recipient
// @route   POST /api/conversations
// @access  Private
const createOrGetConversation = async (req, res, next) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user._id;

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID is required to start a conversation.',
      });
    }

    if (recipientId.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot initiate a conversation with yourself.',
      });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient user does not exist.',
      });
    }

    // Check if conversation already exists between these 2 users
    let conversation = await Conversation.findOne({
      isGroup: false,
      participants: { $all: [currentUserId, recipientId], $size: 2 },
    })
      .populate('participants', 'name username email profileImage status onlineStatus lastSeen')
      .populate('lastMessage');

    if (!conversation) {
      // Create new conversation
      conversation = await Conversation.create({
        participants: [currentUserId, recipientId],
        isGroup: false,
      });

      conversation = await Conversation.findById(conversation._id).populate(
        'participants',
        'name username email profileImage status onlineStatus lastSeen'
      );
    }

    const convObj = conversation.toObject();
    convObj.unreadCount = await Message.countDocuments({
      conversationId: conversation._id,
      sender: { $ne: currentUserId },
      readBy: { $ne: currentUserId },
    });

    res.status(200).json({
      success: true,
      conversation: convObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single conversation by ID
// @route   GET /api/conversations/:id
// @access  Private
const getConversationById = async (req, res, next) => {
  try {
    const currentUserId = req.user._id;
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'name username email profileImage status onlineStatus lastSeen')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name username profileImage',
        },
      });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    // Ensure logged-in user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === currentUserId.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to access this conversation.',
      });
    }

    const convObj = conversation.toObject();
    convObj.unreadCount = await Message.countDocuments({
      conversationId: conversation._id,
      sender: { $ne: currentUserId },
      readBy: { $ne: currentUserId },
    });

    res.json({
      success: true,
      conversation: convObj,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  createOrGetConversation,
  getConversationById,
};
