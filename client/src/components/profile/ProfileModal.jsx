import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import { X, Save, Camera, Sparkles, User, Mail, Shield, Check } from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
];

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [status, setStatus] = useState(user?.status || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [onlineStatus, setOnlineStatus] = useState(user?.onlineStatus || 'online');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await updateProfile({
      name,
      status,
      profileImage,
      onlineStatus,
    });
    setIsSaving(false);
    if (res.success) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Profile & Settings</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Avatar Preview & Presets */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Avatar
                src={profileImage}
                name={name}
                size="lg"
                status={onlineStatus}
              />

              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Choose an avatar preset:
                </span>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px',
                  }}
                >
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <img
                      key={idx}
                      src={preset}
                      alt="Preset"
                      onClick={() => setProfileImage(preset)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        objectFit: 'cover',
                        border: profileImage === preset ? '2px solid var(--accent-emerald)' : '2px solid transparent',
                        transform: profileImage === preset ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status Message / Bio</label>
              <input
                type="text"
                className="input-control"
                placeholder="What's on your mind?"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                maxLength={140}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Presence Status</label>
              <select
                className="input-control"
                value={onlineStatus}
                onChange={(e) => setOnlineStatus(e.target.value)}
              >
                <option value="online">🟢 Online</option>
                <option value="away">🟡 Away</option>
                <option value="busy">🔴 Busy</option>
                <option value="offline">⚪ Invisible / Offline</option>
              </select>
            </div>

            <div
              style={{
                padding: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                marginTop: '16px',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div><strong>Username:</strong> @{user?.username}</div>
              <div><strong>Email:</strong> {user?.email}</div>
              <div><strong>Role:</strong> {user?.role === 'admin' ? 'Administrator 👑' : 'Standard User 👤'}</div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
