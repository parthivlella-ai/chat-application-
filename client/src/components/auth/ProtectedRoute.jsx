import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ adminRequired = false }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          color: 'var(--accent-emerald)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(16, 185, 129, 0.2)',
              borderTopColor: 'var(--accent-emerald)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px auto',
            }}
          />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading CONNECTX...</p>
        </div>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminRequired && user?.role !== 'admin') {
    return <Navigate to="/chat" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
