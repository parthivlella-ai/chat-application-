import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('connectx_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('connectx_token'));
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('connectx_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Session validation error:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = async (loginId, password) => {
    try {
      const res = await api.post('/auth/login', { loginId, password });
      const { token: newToken, user: userData } = res.data;

      localStorage.setItem('connectx_token', newToken);
      localStorage.setItem('connectx_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      showToast(`Welcome back, ${userData.name}!`, 'success');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      const { token: newToken, user: userData } = res.data;

      localStorage.setItem('connectx_token', newToken);
      localStorage.setItem('connectx_user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      showToast('Account registered successfully! Welcome to CONNECTX.', 'success');
      return { success: true };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('connectx_token');
    localStorage.removeItem('connectx_user');
    setToken(null);
    setUser(null);
    showToast('Logged out successfully.', 'info');
  };

  const updateProfile = async (updateData) => {
    try {
      const res = await api.put('/auth/profile', updateData);
      setUser(res.data.user);
      localStorage.setItem('connectx_user', JSON.stringify(res.data.user));
      showToast('Profile updated successfully!', 'success');
      return { success: true, user: res.data.user };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
