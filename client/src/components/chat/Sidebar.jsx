import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';
import {
  MessageSquare,
  Search,
  UserPlus,
  Settings,
  Shield,
  LogOut,
  Sparkles,
  CheckCheck,
} from 'lucide-react';

const Sidebar = ({
  onOpenSearch,
  onOpenProfile,
  onOpenAdmin,
  isMobileDrawerOpen,
  onCloseMobileDrawer,
}) => {
  const { user, logout } = useAuth();
  const { isUserOnline } = useSocket();
  const { conversations, activeConversation, selectConversation, loadingConversations } = useChat();
  const [filterText, setFilterText] = useState('');
  const navigate = useNavigate();

  // Helper to format conversation timestamp
  const formatConvTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Helper to get recipient from 1-on-1 participants
  const getRecipient = (conv) => {
    if (!conv.participants) return { name: 'Chat', username: '', profileImage: '' };
    return (
      conv.participants.find((p) => p._id?.toString() !== user?._id?.toString()) ||
      conv.participants[0] ||
      { name: 'Unknown User', username: '', profileImage: '' }
    );
  };

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const recipient = getRecipient(conv);
    const q = filterText.toLowerCase();
    return (
      recipient.name?.toLowerCase().includes(q) ||
      recipient.username?.toLowerCase().includes(q) ||
      conv.lastMessage?.text?.toLowerCase().includes(q)
    );
  });

  const handleSelect = (conv) => {
    selectConversation(conv);
    if (onCloseMobileDrawer) onCloseMobileDrawer();
  };

  return (
    <aside className={`sidebar ${isMobileDrawerOpen ? '' : 'hidden-mobile'}`}>
      {/* 1. Header with Brand & Actions */}
      <div className="sidebar-header">
        <div className="brand-logo">
          <MessageSquare size={22} color="var(--accent-emerald)" />
          <span>CONNECT<span style={{ color: 'var(--accent-emerald)' }}>X</span></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            className="btn-icon"
            title="Start New Chat"
            onClick={onOpenSearch}
          >
            <UserPlus size={19} />
          </button>

          {user?.role === 'admin' && (
            <button
              className="btn-icon"
              title="Admin Dashboard"
              onClick={onOpenAdmin}
              style={{ color: 'var(--accent-violet)' }}
            >
              <Shield size={19} />
            </button>
          )}

          <button
            className="btn-icon"
            title="Profile & Settings"
            onClick={onOpenProfile}
          >
            <Settings size={19} />
          </button>

          <button
            className="btn-icon"
            title="Sign Out"
            onClick={logout}
          >
            <LogOut size={19} />
          </button>
        </div>
      </div>

      {/* 2. User Info Card */}
      <div
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(15, 21, 35, 0.4)',
          borderBottom: '1px solid var(--border-subtle)',
          cursor: 'pointer',
        }}
        onClick={onOpenProfile}
      >
        <Avatar
          src={user?.profileImage}
          name={user?.name}
          size="md"
          isOnline={true}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {user?.name}
            </span>
            {user?.role === 'admin' && (
              <span className="badge badge-admin">Admin</span>
            )}
          </div>
          <p
            style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user?.status || `@${user?.username}`}
          </p>
        </div>
      </div>

      {/* 3. Search Bar */}
      <div className="sidebar-search">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            className="input-control"
            placeholder="Search chats or messages..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
      </div>

      {/* 4. Conversations List */}
      <div className="conversation-list">
        {loadingConversations ? (
          <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'var(--bg-card)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                color: 'var(--text-muted)',
              }}
            >
              <MessageSquare size={24} />
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '14px' }}>
              {filterText ? 'No matching conversations' : 'No active chats yet'}
            </p>
            <button className="btn btn-primary" style={{ fontSize: '0.85rem' }} onClick={onOpenSearch}>
              <UserPlus size={16} /> Find People
            </button>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const recipient = getRecipient(conv);
            const isOnline = isUserOnline(recipient._id);
            const isActive = activeConversation?._id === conv._id;
            const lastMsg = conv.lastMessage;

            // Preview text
            let previewText = 'No messages yet';
            if (lastMsg) {
              if (lastMsg.isDeleted) {
                previewText = '🚫 This message was deleted';
              } else if (lastMsg.messageType === 'image') {
                previewText = '📷 Photo';
              } else if (lastMsg.messageType === 'file') {
                previewText = '📎 Attachment';
              } else {
                previewText = lastMsg.text;
              }
            }

            return (
              <div
                key={conv._id}
                className={`conversation-item ${isActive ? 'active' : ''}`}
                onClick={() => handleSelect(conv)}
              >
                <Avatar
                  src={recipient.profileImage}
                  name={recipient.name}
                  size="md"
                  isOnline={isOnline}
                />

                <div className="conv-content">
                  <div className="conv-top">
                    <span className="conv-name">{recipient.name}</span>
                    <span className="conv-time">
                      {formatConvTime(conv.updatedAt || conv.createdAt)}
                    </span>
                  </div>

                  <div className="conv-bottom">
                    <span className="conv-preview">{previewText}</span>
                    {conv.unreadCount > 0 && (
                      <span className="badge badge-unread">{conv.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
