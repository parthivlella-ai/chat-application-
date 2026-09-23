import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Lock, Mail, ArrowRight, Shield, Sparkles, AlertCircle } from 'lucide-react';

const Login = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginId || !password) return;

    setErrorMsg('');
    setIsSubmitting(true);
    const result = await login(loginId, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/chat');
    } else {
      setErrorMsg(result.message || 'Invalid credentials. Please try again.');
    }
  };

  const handleQuickLogin = async (email, pwd) => {
    setLoginId(email);
    setPassword(pwd);
    setErrorMsg('');
    setIsSubmitting(true);
    const result = await login(email, pwd);
    setIsSubmitting(false);
    if (result.success) {
      navigate('/chat');
    } else {
      setErrorMsg(result.message || 'Failed to sign in with demo account.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'radial-gradient(circle at 15% 25%, rgba(16, 185, 129, 0.1) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(139, 92, 246, 0.12) 0%, transparent 50%), var(--bg-primary)',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '36px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--gradient-brand)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            }}
          >
            <MessageSquare size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            CONNECT<span style={{ color: 'var(--accent-emerald)' }}>X</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Next-Gen Real-Time Messaging Platform
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#ef4444',
              fontSize: '0.875rem',
              lineHeight: '1.4',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email or Username</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="input-control"
                style={{ paddingLeft: '42px' }}
                placeholder="e.g. alex@connectx.com or alex"
                value={loginId}
                onChange={(e) => {
                  setLoginId(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }}
              />
              <input
                type="password"
                className="input-control"
                style={{ paddingLeft: '42px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '13px', marginTop: '10px', fontSize: '1rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div style={{ marginTop: '26px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginBottom: '12px',
            }}
          >
            <Sparkles size={14} color="var(--accent-amber)" />
            <span>Instant Demo Logins:</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px 10px' }}
              onClick={() => handleQuickLogin('alex@connectx.com', 'Password123!')}
            >
              👤 Alex (User)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px 10px' }}
              onClick={() => handleQuickLogin('sarah@connectx.com', 'Password123!')}
            >
              👤 Sarah (User)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px 10px' }}
              onClick={() => handleQuickLogin('maya@connectx.com', 'Password123!')}
            >
              👤 Maya (User)
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.8rem', padding: '8px 10px', borderColor: 'rgba(139, 92, 246, 0.4)' }}
              onClick={() => handleQuickLogin('admin@connectx.com', 'Password123!')}
            >
              👑 Admin
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-emerald)', textDecoration: 'none', fontWeight: '600' }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
