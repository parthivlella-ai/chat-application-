import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { useToast } from './ToastContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // { [userId]: userName }
  const activeConversationRef = useRef(activeConversation);

  // Keep ref synchronized with state
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // 1. Fetch conversations on load
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    try {
      const res = await api.get('/conversations');
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error('Error fetching conversations:', err.message);
    } finally {
      setLoadingConversations(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // 2. Fetch messages for active conversation
  const fetchMessages = useCallback(async (conversationId, before = null) => {
    if (!conversationId) return;
    if (!before) setLoadingMessages(true);

    try {
      const url = before
        ? `/messages/${conversationId}?before=${before}&limit=30`
        : `/messages/${conversationId}?limit=30`;

      const res = await api.get(url);
      const newMsgs = res.data.messages || [];

      if (before) {
        // Prepend older messages
        setMessages((prev) => [...newMsgs, ...prev]);
      } else {
        setMessages(newMsgs);
      }

      setHasMoreMessages(res.data.hasMore || false);

      // Reset unread count for this conversation locally
      setConversations((prev) =>
        prev.map((c) => (c._id === conversationId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error('Error fetching messages:', err.message);
      showToast('Could not load messages. Please try again.', 'error');
    } finally {
      if (!before) setLoadingMessages(false);
    }
  }, [showToast]);

  // 3. Load older messages (pagination)
  const loadOlderMessages = useCallback(() => {
    if (!activeConversation || messages.length === 0 || !hasMoreMessages) return;
    const oldestTimestamp = messages[0]?.createdAt;
    if (oldestTimestamp) {
      fetchMessages(activeConversation._id, oldestTimestamp);
    }
  }, [activeConversation, messages, hasMoreMessages, fetchMessages]);

  // 4. Select a conversation
  const selectConversation = useCallback(
    (conv) => {
      if (activeConversationRef.current?._id === conv._id) return;

      // Leave previous socket room
      if (socket && activeConversationRef.current) {
        socket.emit('leave_conversation', activeConversationRef.current._id);
      }

      setActiveConversation(conv);
      setMessages([]);
      setTypingUsers({});

      // Join new socket room
      if (socket && conv?._id) {
        socket.emit('join_conversation', conv._id);
      }

      fetchMessages(conv._id);
    },
    [socket, fetchMessages]
  );

  // 5. Start or open conversation with another user
  const startConversationWithUser = useCallback(
    async (recipientUser) => {
      try {
        const res = await api.post('/conversations', { recipientId: recipientUser._id });
        const conv = res.data.conversation;

        // Check if already in conversation list
        setConversations((prev) => {
          const exists = prev.some((c) => c._id === conv._id);
          if (exists) {
            return prev.map((c) => (c._id === conv._id ? conv : c));
          }
          return [conv, ...prev];
        });

        selectConversation(conv);
        return conv;
      } catch (err) {
        showToast(err.message, 'error');
      }
    },
    [selectConversation, showToast]
  );

  // 6. Send message
  const sendMessage = useCallback(
    async ({ text, file, attachment, messageType = 'text' }) => {
      if (!activeConversation) return;

      try {
        let res;
        if (file) {
          const formData = new FormData();
          formData.append('conversationId', activeConversation._id);
          if (text) formData.append('text', text);
          formData.append('attachment', file);
          formData.append('messageType', messageType);

          res = await api.post('/messages', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        } else {
          res = await api.post('/messages', {
            conversationId: activeConversation._id,
            text,
            attachment,
            messageType,
          });
        }

        const sentMsg = res.data.message;

        // Emit via Socket.IO
        if (socket) {
          socket.emit('send_message', sentMsg);
        }

        // Update local state
        setMessages((prev) => [...prev, sentMsg]);

        // Update conversations lastMessage preview
        setConversations((prev) =>
          prev.map((c) =>
            c._id === activeConversation._id
              ? { ...c, lastMessage: sentMsg, updatedAt: sentMsg.createdAt }
              : c
          )
        );

        return sentMsg;
      } catch (err) {
        showToast(err.message, 'error');
        throw err;
      }
    },
    [activeConversation, socket, showToast]
  );

  // 7. Edit message
  const editMessage = useCallback(
    async (messageId, newText) => {
      try {
        const res = await api.put(`/messages/${messageId}`, { text: newText });
        const updatedMsg = res.data.message;

        // Update in state
        setMessages((prev) => prev.map((m) => (m._id === messageId ? updatedMsg : m)));

        // Broadcast edit
        if (socket) {
          socket.emit('message_updated', updatedMsg);
        }

        showToast('Message updated.', 'info');
      } catch (err) {
        showToast(err.message, 'error');
      }
    },
    [socket, showToast]
  );

  // 8. Delete message
  const deleteMessage = useCallback(
    async (messageId, deleteForEveryone = false) => {
      try {
        const res = await api.delete(`/messages/${messageId}?deleteForEveryone=${deleteForEveryone}`);

        if (deleteForEveryone) {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === messageId
                ? {
                    ...m,
                    isDeleted: true,
                    text: 'This message was deleted',
                    attachment: { url: '' },
                  }
                : m
            )
          );

          if (socket && activeConversation) {
            socket.emit('message_deleted', {
              conversationId: activeConversation._id,
              messageId,
              isDeleted: true,
            });
          }
        } else {
          // Remove from own view
          setMessages((prev) => prev.filter((m) => m._id !== messageId));
        }

        showToast('Message removed.', 'info');
      } catch (err) {
        showToast(err.message, 'error');
      }
    },
    [socket, activeConversation, showToast]
  );

  // 9. Typing emitters
  const emitTypingStart = useCallback(() => {
    if (socket && activeConversation && user) {
      socket.emit('typing_start', {
        conversationId: activeConversation._id,
        userId: user._id,
        userName: user.name,
      });
    }
  }, [socket, activeConversation, user]);

  const emitTypingStop = useCallback(() => {
    if (socket && activeConversation && user) {
      socket.emit('typing_stop', {
        conversationId: activeConversation._id,
        userId: user._id,
      });
    }
  }, [socket, activeConversation, user]);

  // 10. Real-Time Socket Event Listeners
  useEffect(() => {
    if (!socket) return;

    // Receive new message
    const handleReceiveMessage = (msg) => {
      if (activeConversationRef.current?._id === msg.conversationId) {
        setMessages((prev) => {
          // Avoid duplicate insertion
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });

        // Send read receipt if received from other user
        if (msg.sender?._id !== user?._id) {
          socket.emit('message_read', {
            conversationId: msg.conversationId,
            messageId: msg._id,
            readerId: user?._id,
          });
        }
      }

      // Update sidebar conversation item preview & bump to top
      setConversations((prev) => {
        const found = prev.find((c) => c._id === msg.conversationId);
        if (!found) {
          fetchConversations();
          return prev;
        }

        const isCurrentChat = activeConversationRef.current?._id === msg.conversationId;
        const updated = {
          ...found,
          lastMessage: msg,
          updatedAt: msg.createdAt,
          unreadCount:
            isCurrentChat || msg.sender?._id === user?._id
              ? 0
              : (found.unreadCount || 0) + 1,
        };

        const others = prev.filter((c) => c._id !== msg.conversationId);
        return [updated, ...others];
      });
    };

    // Notification for messages when conversation is not open
    const handleNewMessageNotification = ({ conversationId, message }) => {
      if (activeConversationRef.current?._id !== conversationId) {
        showToast(`New message from ${message.sender?.name || 'someone'}`, 'info');
      }
    };

    // Typing start
    const handleTypingStart = ({ conversationId, userId, userName }) => {
      if (activeConversationRef.current?._id === conversationId && userId !== user?._id) {
        setTypingUsers((prev) => ({ ...prev, [userId]: userName }));
      }
    };

    // Typing stop
    const handleTypingStop = ({ conversationId, userId }) => {
      if (activeConversationRef.current?._id === conversationId) {
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }
    };

    // Message read receipt
    const handleMessageRead = ({ messageId, readerId }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id === messageId || !messageId) {
            const hasRead = m.readBy?.some((id) => id.toString() === readerId.toString());
            if (!hasRead) {
              return { ...m, readBy: [...(m.readBy || []), readerId] };
            }
          }
          return m;
        })
      );
    };

    // Message updated
    const handleMessageUpdated = (updatedMsg) => {
      if (activeConversationRef.current?._id === updatedMsg.conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
        );
      }
    };

    // Message deleted
    const handleMessageDeleted = ({ conversationId, messageId }) => {
      if (activeConversationRef.current?._id === conversationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, isDeleted: true, text: 'This message was deleted', attachment: { url: '' } }
              : m
          )
        );
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('new_message_notification', handleNewMessageNotification);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);
    socket.on('message_read', handleMessageRead);
    socket.on('message_updated', handleMessageUpdated);
    socket.on('message_deleted', handleMessageDeleted);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('new_message_notification', handleNewMessageNotification);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
      socket.off('message_read', handleMessageRead);
      socket.off('message_updated', handleMessageUpdated);
      socket.off('message_deleted', handleMessageDeleted);
    };
  }, [socket, user?._id, fetchConversations, showToast]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        loadingMessages,
        loadingConversations,
        hasMoreMessages,
        typingUsers,
        selectConversation,
        startConversationWithUser,
        sendMessage,
        editMessage,
        deleteMessage,
        loadOlderMessages,
        emitTypingStart,
        emitTypingStop,
        fetchConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
