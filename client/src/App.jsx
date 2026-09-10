import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ChatProvider } from './context/ChatContext';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ChatLayout from './components/chat/ChatLayout';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SocketProvider>
          <ChatProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Chat Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/chat" element={<ChatLayout />} />
                  <Route path="/" element={<Navigate to="/chat" replace />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/chat" replace />} />
              </Routes>
            </BrowserRouter>
          </ChatProvider>
        </SocketProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
