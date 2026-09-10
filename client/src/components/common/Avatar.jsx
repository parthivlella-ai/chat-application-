import React from 'react';

const Avatar = ({ src, name = 'User', size = 'md', isOnline = false, status = null, onClick }) => {
  const fallback = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="avatar-wrapper" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`avatar-img ${size}`}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;
          }}
        />
      ) : (
        <div
          className={`avatar-img ${size}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: size === 'lg' ? '1.5rem' : size === 'sm' ? '0.8rem' : '1.1rem',
            color: '#fff',
          }}
        >
          {fallback}
        </div>
      )}

      {status && (
        <span className={`status-dot ${status}`} title={`Status: ${status}`} />
      )}
      {!status && isOnline && (
        <span className="status-dot online" title="Online" />
      )}
    </div>
  );
};

export default Avatar;
