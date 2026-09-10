const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// @desc    Get paginated messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;
    const limit = parseInt(req.query.limit, 10) || 30;
    const before = req.query.before; // Cursor for pagination (ISO timestamp or ObjectId)

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === currentUserId.toString()
    );

    if (!isParticipant && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation.',
      });
    }

    const query = {
      conversationId,
      deletedFor: { $ne: currentUserId },
    };

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name username profileImage')
      .sort({ createdAt: -1 })
      .limit(limit);

    // Count total messages for hasMore flag
    const totalCount = await Message.countDocuments({
      conversationId,
      deletedFor: { $ne: currentUserId },
    });

    // Auto mark retrieved unread messages as read by current user
    const unreadMessageIds = messages
      .filter(
        (m) =>
          m.sender._id.toString() !== currentUserId.toString() &&
          !m.readBy.some((id) => id.toString() === currentUserId.toString())
      )
      .map((m) => m._id);

    if (unreadMessageIds.length > 0) {
      await Message.updateMany(
        { _id: { $in: unreadMessageIds } },
        { $addToSet: { readBy: currentUserId } }
      );
    }

    // Return messages in chronological order (oldest first)
    res.json({
      success: true,
      messages: messages.reverse(),
      hasMore: messages.length === limit,
      totalCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a new message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res, next) => {
  try {
    const { conversationId, text, messageType } = req.body;
    const currentUserId = req.user._id;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID is required.',
      });
    }

    // Check conversation membership
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found.',
      });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === currentUserId.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You cannot send messages to a conversation you do not belong to.',
      });
    }

    let attachmentData = { url: '', fileName: '', fileSize: 0, fileType: '' };
    let finalMessageType = messageType || 'text';

    if (req.file) {
      const isImg = req.file.mimetype.startsWith('image/');
      finalMessageType = isImg ? 'image' : 'file';
      attachmentData = {
        url: `/uploads/${req.file.filename}`,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
      };
    }

    if (!text && !req.file && (!req.body.attachment || !req.body.attachment.url)) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.',
      });
    }

    // Direct attachment URL provided in body (e.g., base64 or remote URL)
    if (req.body.attachment && req.body.attachment.url) {
      attachmentData = req.body.attachment;
      if (req.body.attachment.fileType && req.body.attachment.fileType.startsWith('image/')) {
        finalMessageType = 'image';
      }
    }

    const message = await Message.create({
      conversationId,
      sender: currentUserId,
      text: text ? text.trim() : '',
      messageType: finalMessageType,
      attachment: attachmentData,
      readBy: [currentUserId],
    });

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name username profileImage'
    );

    // Update conversation's lastMessage and timestamp
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit a message
// @route   PUT /api/messages/:id
// @access  Private
const editMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const currentUserId = req.user._id;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message text cannot be empty.',
      });
    }

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.',
      });
    }

    // Only original sender can edit
    if (message.sender.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages.',
      });
    }

    if (message.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit a deleted message.',
      });
    }

    message.text = text.trim();
    message.isEdited = true;
    await message.save();

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name username profileImage'
    );

    res.json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a message (soft delete)
// @route   DELETE /api/messages/:id
// @access  Private
const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deleteForEveryone } = req.query;
    const currentUserId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.',
      });
    }

    if (deleteForEveryone === 'true') {
      // Must be sender or admin
      if (message.sender.toString() !== currentUserId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only delete your own messages for everyone.',
        });
      }

      message.isDeleted = true;
      message.text = 'This message was deleted';
      message.attachment = { url: '', fileName: '', fileSize: 0, fileType: '' };
      await message.save();
    } else {
      // Delete for self only
      if (!message.deletedFor.includes(currentUserId)) {
        message.deletedFor.push(currentUserId);
        await message.save();
      }
    }

    res.json({
      success: true,
      message: 'Message deleted successfully.',
      deletedMessageId: message._id,
      isDeleted: message.isDeleted,
      conversationId: message.conversationId,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single message as read
// @route   PUT /api/messages/:id/read
// @access  Private
const markMessageRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found.',
      });
    }

    if (!message.readBy.some((userId) => userId.toString() === currentUserId.toString())) {
      message.readBy.push(currentUserId);
      await message.save();
    }

    res.json({
      success: true,
      message: 'Message marked as read.',
      readBy: message.readBy,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all messages in a conversation as read
// @route   PUT /api/messages/conversation/:conversationId/read
// @access  Private
const markConversationRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user._id;

    await Message.updateMany(
      {
        conversationId,
        readBy: { $ne: currentUserId },
      },
      {
        $addToSet: { readBy: currentUserId },
      }
    );

    res.json({
      success: true,
      message: 'All messages marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search messages
// @route   GET /api/messages/search
// @access  Private
const searchMessages = async (req, res, next) => {
  try {
    const { q, conversationId } = req.query;
    const currentUserId = req.user._id;

    if (!q || q.trim() === '') {
      return res.json({ success: true, messages: [] });
    }

    // Find conversations user is part of
    const userConversations = await Conversation.find({
      participants: currentUserId,
    }).select('_id');

    const conversationIds = userConversations.map((c) => c._id);

    const query = {
      conversationId: conversationId ? conversationId : { $in: conversationIds },
      deletedFor: { $ne: currentUserId },
      isDeleted: { $ne: true },
      text: { $regex: q.trim(), $options: 'i' },
    };

    const messages = await Message.find(query)
      .populate('sender', 'name username profileImage')
      .populate('conversationId')
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markMessageRead,
  markConversationRead,
  searchMessages,
};
