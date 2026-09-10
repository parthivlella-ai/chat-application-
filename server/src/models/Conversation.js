const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    // Track unread counts per user: Map of userId -> number
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      default: '',
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
