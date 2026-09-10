const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    reason: {
      type: String,
      required: true,
      enum: ['spam', 'harassment', 'inappropriate_content', 'other'],
    },
    details: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed', 'action_taken'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Report', reportSchema);
