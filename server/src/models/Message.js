const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      default: '',
      trim: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file'],
      default: 'text',
    },
    attachment: {
      url: { type: String, default: '' },
      fileName: { type: String, default: '' },
      fileSize: { type: Number, default: 0 },
      fileType: { type: String, default: '' },
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedFor: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast message pagination & search
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ text: 'text' });

module.exports = mongoose.model('Message', messageSchema);
