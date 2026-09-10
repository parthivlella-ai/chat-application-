import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Avatar from '../common/Avatar';
import {
  Shield,
  X,
  Users,
  MessageSquare,
  Activity,
  UserX,
  UserCheck,
  Search,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

const AdminDashboard = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get(`/admin/users?search=${encodeURIComponent(searchQuery)}`),
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen, searchQuery]);

  if (!isOpen) return null;

  const handleToggleBlock = async (userId, userName) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-block`);
      showToast(res.data.message, 'success');
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBlocked: res.data.isBlocked } : u))
      );
      // Refresh stats
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data.stats);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px', width: '95%' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(139, 92, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-violet)',
              }}
            >
              <Shield size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>Admin Console</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                System Metrics & User Moderation
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn-icon" onClick={fetchAdminData} title="Refresh metrics">
              <RefreshCw size={16} />
            </button>
            <button className="btn-icon" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ maxHeight: '80vh' }}>
          {/* 1. Statistics Cards */}
          {stats && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '14px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-emerald)' }}>
                  <Users size={20} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '8px' }}>
                  {stats.totalUsers}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Registered Users</div>
              </div>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-violet)' }}>
                  <MessageSquare size={20} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '8px' }}>
                  {stats.totalMessages}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Messages Exchanged</div>
              </div>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-cyan)' }}>
                  <Activity size={20} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>24h</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '8px' }}>
                  {stats.activeUsersToday}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Active Today</div>
              </div>

              <div
                style={{
                  background: 'var(--bg-tertiary)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-rose)' }}>
                  <UserX size={20} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Banned</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '8px' }}>
                  {stats.blockedUsers}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Suspended Accounts</div>
              </div>
            </div>
          )}

          {/* 2. User Moderation Table */}
          <div style={{ marginTop: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
              }}
            >
              <h4 style={{ fontSize: '0.98rem', fontWeight: '700' }}>User Management Directory</h4>
              <div className="search-box" style={{ width: '220px' }}>
                <Search size={15} />
                <input
                  type="text"
                  className="input-control"
                  style={{ padding: '8px 10px 8px 36px', fontSize: '0.82rem' }}
                  placeholder="Filter users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div
              style={{
                overflowX: 'auto',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '12px 14px' }}>User</th>
                    <th style={{ padding: '12px 14px' }}>Email</th>
                    <th style={{ padding: '12px 14px' }}>Role</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: u.isBlocked ? 'rgba(244, 63, 94, 0.05)' : 'transparent',
                      }}
                    >
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Avatar src={u.profileImage} name={u.name} size="sm" />
                          <div>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{u.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-admin' : ''}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        {u.isBlocked ? (
                          <span style={{ color: 'var(--accent-rose)', fontWeight: '600' }}>Suspended</span>
                        ) : (
                          <span style={{ color: 'var(--accent-emerald)', fontWeight: '600' }}>Active</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                        {u.role !== 'admin' && (
                          <button
                            type="button"
                            className={`btn ${u.isBlocked ? 'btn-primary' : 'btn-danger'}`}
                            style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                            onClick={() => handleToggleBlock(u._id, u.name)}
                          >
                            {u.isBlocked ? (
                              <>
                                <UserCheck size={14} /> Unban
                              </>
                            ) : (
                              <>
                                <UserX size={14} /> Suspend
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
