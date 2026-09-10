const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Map: userId -> Set of socketIds (to support multi-tab connections per user)
const onlineUsers = new Map();

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    let currentUserId = null;

    // 1. User Connects / Identifies
    socket.on('user_connected', async (userId) => {
      if (!userId) return;
      currentUserId = userId.toString();

      // Add socket ID to user's active connection set
      if (!onlineUsers.has(currentUserId)) {
        onlineUsers.set(currentUserId, new Set());
      }
      onlineUsers.get(currentUserId).add(socket.id);
      socket.userId = currentUserId;

      // Update user in DB as online
      try {
        await User.findByIdAndUpdate(currentUserId, {
          onlineStatus: 'online',
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error('[Socket] Failed to update user online status:', err.message);
      }

      // Broadcast to ALL clients that this user is online
      io.emit('user_online', {
        userId: currentUserId,
        onlineStatus: 'online',
        lastSeen: new Date(),
      });

      // Send the currently online user IDs list back to the connecting client
      const onlineUserIds = Array.from(onlineUsers.keys());
      socket.emit('get_online_users', onlineUserIds);
    });

    // 2. Join Conversation Room
    socket.on('join_conversation', (conversationId) => {
      if (!conversationId) return;
      socket.join(conversationId.toString());
    });

    // 3. Leave Conversation Room
    socket.on('leave_conversation', (conversationId) => {
      if (!conversationId) return;
      socket.leave(conversationId.toString());
    });

    // 4. Send Real-Time Message Event
    socket.on('send_message', async (messageData) => {
      try {
        if (!messageData || !messageData.conversationId) return;
        const convId = messageData.conversationId.toString();

        // Broadcast to everyone in conversation room (including sender or excluding based on UI optimism)
        io.to(convId).emit('receive_message', messageData);

        // Also notify participants who might not have currently opened the chat room
        try {
          const conversation = await Conversation.findById(convId).select('participants');
          if (conversation && conversation.participants) {
            conversation.participants.forEach((participantId) => {
              const pId = participantId.toString();
              if (pId !== (messageData.sender?._id || messageData.sender)?.toString()) {
                const userSockets = onlineUsers.get(pId);
                if (userSockets) {
                  userSockets.forEach((sId) => {
                    io.to(sId).emit('new_message_notification', {
                      conversationId: convId,
                      message: messageData,
                    });
                  });
                }
              }
            });
          }
        } catch (convErr) {
          console.error('[Socket] Error notifying participants:', convErr.message);
        }
      } catch (err) {
        console.error('[Socket] send_message error:', err.message);
      }
    });

    // 5. Typing Indicators
    socket.on('typing_start', ({ conversationId, userId, userName }) => {
      if (!conversationId) return;
      socket.to(conversationId.toString()).emit('typing_start', {
        conversationId,
        userId,
        userName,
      });
    });

    socket.on('typing_stop', ({ conversationId, userId }) => {
      if (!conversationId) return;
      socket.to(conversationId.toString()).emit('typing_stop', {
        conversationId,
        userId,
      });
    });

    // 6. Message Read Receipt Event
    socket.on('message_read', ({ conversationId, messageId, readerId }) => {
      if (!conversationId) return;
      io.to(conversationId.toString()).emit('message_read', {
        conversationId,
        messageId,
        readerId,
      });
    });

    // 7. Message Edited Event
    socket.on('message_updated', (updatedMessage) => {
      if (!updatedMessage || !updatedMessage.conversationId) return;
      io.to(updatedMessage.conversationId.toString()).emit('message_updated', updatedMessage);
    });

    // 8. Message Deleted Event
    socket.on('message_deleted', ({ conversationId, messageId, isDeleted }) => {
      if (!conversationId) return;
      io.to(conversationId.toString()).emit('message_deleted', {
        conversationId,
        messageId,
        isDeleted,
      });
    });

    // 9. Disconnect Handling
    socket.on('disconnect', async () => {
      if (currentUserId && onlineUsers.has(currentUserId)) {
        const userSocketSet = onlineUsers.get(currentUserId);
        userSocketSet.delete(socket.id);

        // If no more active socket connections for this user, mark as offline
        if (userSocketSet.size === 0) {
          onlineUsers.delete(currentUserId);
          const now = new Date();

          try {
            await User.findByIdAndUpdate(currentUserId, {
              onlineStatus: 'offline',
              lastSeen: now,
            });
          } catch (err) {
            console.error('[Socket] Failed to update offline status:', err.message);
          }

          // Broadcast user_offline
          io.emit('user_offline', {
            userId: currentUserId,
            onlineStatus: 'offline',
            lastSeen: now,
          });
        }
      }
    });
  });
};

module.exports = { initializeSocket, onlineUsers };
