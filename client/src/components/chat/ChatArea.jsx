import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import {
  Menu,
  Phone,
  Video,
  Info,
  Search,
  MessageSquare,
  ArrowDown,
  Sparkles,
  ChevronUp,
} from 'lucide-react';

const ChatArea = ({
  onToggleMobileDrawer,
  onOpenSearch,
  onImageClick,
  onEditMessage,
  onDeleteMessage,
}) => {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const {
    activeConversation,
    messages,
    loadingMessages,
    hasMoreMessages,
    loadOlderMessages,
    typingUsers,
  } = useChat();

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Get other participant in 1-on-1 chat
  const recipient = activeConversation?.participants?.find(
    (p) => p._id?.toString() !== user?._id?.toString()
  ) || {
    name: 'CONNECTX User',
    username: '',
    profileImage: '',
    status: '',
    lastSeen: null,
  };

  const isOnline = isUserOnline(recipient._id);

  // Auto-scroll to bottom on new messages
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [activeConversation?._id]);

  useEffect(() => {
    // Only auto-scroll if user is already near bottom
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 250;
      if (isNearBottom) {
        scrollToBottom(true);
      }
    }
  }, [messages]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 300);
  };

  const formatLastSeen = (dateStr) => {
    if (!dateStr) return 'Offline';
    const date = new Date(dateStr);
    const diffMins = Math.floor((Date.now() - date.getTime()) / (60 * 1000));
    if (diffMins < 1) return 'Active just now';
    if (diffMins < 60) return `Active ${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    return `Last seen ${date.toLocaleDateString()}`;
  };

  // If no conversation is active, show modern placeholder state
  if (!activeConversation) {
    return (
      <main className="chat-main" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '30px' }}>
        <div style={{ position: 'absolute', top: '16px', left: '16px' }} className="mobile-only-btn">
          <button className="btn-icon" onClick={onToggleMobileDrawer}>
            <Menu size={22} />
          </button>
        </div>

        <div
          style={{
            maxWidth: '460px',
            padding: '40px 30px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'var(--gradient-brand)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)',
            }}
          >
            <MessageSquare size={32} color="#fff" />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '8px' }}>
            Welcome to CONNECT<span style={{ color: 'var(--accent-emerald)' }}>X</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '24px' }}>
            Select a conversation from the sidebar or start a new real-time chat with friends and colleagues across the network.
          </p>

          <button className="btn btn-primary" onClick={onOpenSearch}>
            <Sparkles size={18} /> Start New Conversation
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="chat-main">
      {/* 1. Active Chat Header */}
      <header className="chat-header">
        <div className="chat-header-user">
          <button
            className="btn-icon"
            onClick={onToggleMobileDrawer}
            style={{ marginRight: '4px' }}
            title="Open chats"
          >
            <Menu size={20} />
          </button>

          <Avatar
            src={recipient.profileImage}
            name={recipient.name}
            size="md"
            isOnline={isOnline}
          />

          <div className="chat-user-details">
            <h3>{recipient.name}</h3>
            <p style={{ color: isOnline ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
              {isOnline ? 'Active Now' : formatLastSeen(recipient.lastSeen)}
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="btn-icon"
            title="Search in messages"
            onClick={onOpenSearch}
          >
            <Search size={19} />
          </button>
        </div>
      </header>

      {/* 2. Messages Stream */}
      <div
        className="chat-messages"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {/* Pagination: Load older button */}
        {hasMoreMessages && (
          <div style={{ textAlign: 'center', margin: '10px 0' }}>
            <button
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: 'var(--radius-full)' }}
              onClick={loadOlderMessages}
            >
              <ChevronUp size={15} /> Load earlier messages
            </button>
          </div>
        )}

        {loadingMessages ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              No messages yet
            </p>
            <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>
              Say hello to start the conversation! 👋
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg._id}
              message={msg}
              currentUserId={user?._id}
              onImageClick={onImageClick}
              onEdit={onEditMessage}
              onDelete={onDeleteMessage}
            />
          ))
        )}

        {/* Real-time Typing indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll-to-Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '28px',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
          title="Scroll to bottom"
        >
          <ArrowDown size={18} />
        </button>
      )}

      {/* 3. Bottom Message Input */}
      <MessageInput />
    </main>
  );
};

export default ChatArea;
