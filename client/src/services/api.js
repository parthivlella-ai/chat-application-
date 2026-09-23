import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL 
  ? (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if stored
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('connectx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Extract user-friendly error messages
api.interceptors.response.use(
  (response) => {
    // If request returned 200 but body is HTML (e.g., SPA rewrites when backend is missing on static hosting)
    if (
      typeof response.data === 'string' &&
      (response.data.includes('<!DOCTYPE html>') || response.data.includes('<!doctype html>'))
    ) {
      return Promise.reject(
        new Error('Cannot reach backend server. Please verify your API URL configuration.')
      );
    }
    return response;
  },
  (error) => {
    let message = '';

    // 1. Structured backend responses
    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'string') {
        if (data.includes('<!DOCTYPE html>') || data.includes('<!doctype html>')) {
          if (error.response.status === 404) {
            message = 'API endpoint not found. Backend server may be offline or misconfigured.';
          } else if (error.response.status === 405) {
            message = 'API endpoint not reachable (Method Not Allowed). Check your backend server URL.';
          } else if (error.response.status >= 500) {
            message = 'Backend server is currently unavailable. Please make sure the server is running on port 5000.';
          }
        } else if (data.trim().length > 0 && data.trim().length < 250) {
          message = data.trim();
        }
      } else if (typeof data === 'object') {
        if (data.message) {
          message = data.message;
        } else if (data.error) {
          message = typeof data.error === 'string' ? data.error : (data.error.message || JSON.stringify(data.error));
        } else if (Array.isArray(data.errors) && data.errors.length > 0) {
          message = data.errors.map((e) => e.msg || e.message || String(e)).join(', ');
        }
      }
    }

    // 2. Status code specific fallbacks
    if (!message) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            message = 'Invalid request. Please check your inputs.';
            break;
          case 401:
            message = 'Invalid credentials. Please check your username/email and password.';
            break;
          case 403:
            message = 'Access denied. You do not have permission.';
            break;
          case 404:
            message = 'API endpoint not found. Please ensure the backend server is running.';
            break;
          case 405:
            message = 'Method Not Allowed. Please verify your backend server connection.';
            break;
          case 429:
            message = 'Too many attempts. Please wait a moment before trying again.';
            break;
          case 500:
            message = 'Server connection failed. Please ensure the backend is running on port 5000.';
            break;
          case 502:
          case 503:
          case 504:
            message = 'Backend server is offline or waking up. Please try again shortly.';
            break;
          default:
            message = error.response.statusText || 'Unable to complete request. Please try again.';
        }
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        message = 'Request timed out. Server took too long to respond.';
      } else {
        message = 'Cannot connect to server. Please ensure the backend server is running on port 5000.';
      }
    }

    // If 401 Unauthorized and not already on auth page, trigger logout
    if (error.response?.status === 401) {
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        localStorage.removeItem('connectx_token');
        localStorage.removeItem('connectx_user');
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
