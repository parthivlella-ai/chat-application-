import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Lock, Mail, User, ArrowRight, Sparkles } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });
    setIsSubmitting(false);

    if (result.success) {
      navigate('/chat');
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
        background: 'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.12) 0%, transparent 45%), radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), var(--bg-primary)',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '36px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'var(--gradient-brand)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
            }}
          >
            <MessageSquare size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.7rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Join CONNECT<span style={{ color: 'var(--accent-emerald)' }}>X</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '4px' }}>
            Create your account to start real-time messaging
          </p>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid var(--accent-rose)',
              color: '#fecdd3',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="input-control"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                name="username"
                className="input-control"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{ position: 'absolute', left: '14px', top: '14px', color: 'var(--text-muted)' }}
              />
              <input
                type="email"
                name="email"
                className="input-control"
                style={{ paddingLeft: '42px' }}
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="input-control"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="input-control"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
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
            {isSubmitting ? 'Creating account...' : 'Create Account'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-emerald)', textDecoration: 'none', fontWeight: '600' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
