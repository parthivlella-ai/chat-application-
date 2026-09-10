import React from 'react';
import { useSocket } from '../../context/SocketContext';
import { WifiOff, RefreshCw } from 'lucide-react';

const ConnectionBanner = () => {
  const { connectionStatus } = useSocket();

  if (connectionStatus === 'connected') return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: connectionStatus === 'reconnecting' ? 'rgba(245, 158, 11, 0.9)' : 'rgba(244, 63, 94, 0.9)',
        color: '#ffffff',
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '0.85rem',
        fontWeight: '600',
        zIndex: 1000,
        backdropFilter: 'blur(8px)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      }}
    >
      {connectionStatus === 'reconnecting' ? (
        <>
          <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
          <span>Connection lost. Reconnecting to real-time chat server...</span>
        </>
      ) : (
        <>
          <WifiOff size={15} />
          <span>Real-time server disconnected. Please check your network connection.</span>
        </>
      )}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ConnectionBanner;
