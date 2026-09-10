import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useChat } from '../../context/ChatContext';
import { useSocket } from '../../context/SocketContext';
import Avatar from '../common/Avatar';
import { Search, X, Users, MessageSquare, ArrowRight, Sparkles } from 'lucide-react';

const SearchModal = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState('users'); // 'users' | 'messages'
  const [query, setQuery] = useState('');
  const [usersList, setUsersList] = useState([]);
  const [messagesList, setMessagesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { startConversationWithUser, selectConversation, conversations } = useChat();
  const { isUserOnline } = useSocket();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setUsersList([]);
      setMessagesList([]);
      return;
    }

    // Initial fetch of users
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/users?search=${encodeURIComponent(query)}`);
        setUsersList(res.data.users || []);
      } catch (err) {
        console.error('User search error:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchMessages = async () => {
      if (!query.trim()) {
        setMessagesList([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await api.get(`/messages/search?q=${encodeURIComponent(query)}`);
        setMessagesList(res.data.messages || []);
      } catch (err) {
        console.error('Message search error:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    const timeout = setTimeout(() => {
      if (tab === 'users') {
        fetchUsers();
      } else {
        fetchMessages();
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [isOpen, query, tab]);

  if (!isOpen) return null;

  const handleUserClick = async (user) => {
    await startConversationWithUser(user);
    onClose();
  };

  const handleMessageClick = (msg) => {
    const conv = conversations.find(
      (c) => c._id === (msg.conversationId?._id || msg.conversationId)
    );
    if (conv) {
      selectConversation(conv);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`btn ${tab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              onClick={() => setTab('users')}
            >
              <Users size={15} /> Find Users
            </button>
            <button
              type="button"
              className={`btn ${tab === 'messages' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              onClick={() => setTab('messages')}
            >
              <MessageSquare size={15} /> Search Messages
            </button>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '16px 20px 0 20px' }}>
          <div className="search-box">
            <Search size={17} />
            <input
              type="text"
              className="input-control"
              placeholder={tab === 'users' ? 'Search by name, username or email...' : 'Search message text...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="modal-body" style={{ minHeight: '260px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              Searching...
            </div>
          ) : tab === 'users' ? (
            usersList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                No users found matching "{query}"
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {usersList.map((u) => {
                  const online = isUserOnline(u._id);
                  return (
                    <div
                      key={u._id}
                      onClick={() => handleUserClick(u)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--bg-card)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        border: '1px solid var(--border-color)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-emerald)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Avatar src={u.profileImage} name={u.name} size="md" isOnline={online} />
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            @{u.username} • {online ? <span style={{ color: 'var(--accent-emerald)' }}>Online</span> : 'Offline'}
                          </div>
                        </div>
                      </div>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                        Chat <ArrowRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )
          ) : messagesList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              {query ? `No messages found matching "${query}"` : 'Type something to search messages'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {messagesList.map((m) => (
                <div
                  key={m._id}
                  onClick={() => handleMessageClick(m)}
                  style={{
                    padding: '12px 14px',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--accent-emerald)' }}>
                      {m.sender?.name}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                    {m.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
