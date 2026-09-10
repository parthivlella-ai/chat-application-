import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connected' | 'reconnecting' | 'disconnected'
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      // Create new socket connection
      const socketUrl =
        import.meta.env.VITE_SERVER_URL ||
        (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.startsWith('/')
          ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
          : window.location.origin);

      const newSocket = io(socketUrl, {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000,
        transports: ['websocket', 'polling'],
      });

      socketRef.current = newSocket;
      setSocket(newSocket);
      setConnectionStatus('connecting');

      newSocket.on('connect', () => {
        setConnectionStatus('connected');
        newSocket.emit('user_connected', user._id);
      });

      newSocket.on('get_online_users', (userIds) => {
        setOnlineUsers(new Set(userIds));
      });

      newSocket.on('user_online', ({ userId }) => {
        setOnlineUsers((prev) => new Set([...prev, userId]));
      });

      newSocket.on('user_offline', ({ userId }) => {
        setOnlineUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      });

      newSocket.on('disconnect', () => {
        setConnectionStatus('disconnected');
      });

      newSocket.on('reconnect_attempt', () => {
        setConnectionStatus('reconnecting');
      });

      newSocket.on('reconnect', () => {
        setConnectionStatus('connected');
        newSocket.emit('user_connected', user._id);
      });

      return () => {
        newSocket.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnectionStatus('disconnected');
      };
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnectionStatus('disconnected');
      }
    }
  }, [isAuthenticated, user?._id]);

  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineUsers.has(userId.toString());
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        isUserOnline,
        connectionStatus,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
