import React, { useState } from 'react';
import Avatar from '../common/Avatar';
import {
  Check,
  CheckCheck,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  FileText,
  Download,
  AlertCircle,
} from 'lucide-react';

const MessageBubble = ({
  message,
  currentUserId,
  onImageClick,
  onEdit,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const senderId = (message.sender?._id || message.sender)?.toString();
  const isSentByMe = senderId === currentUserId?.toString();
  const isDeleted = message.isDeleted;

  // Format timestamp (e.g., 2:45 PM)
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isReadByOther =
    message.readBy &&
    message.readBy.length > 1; // More than just the sender

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
    }
    setShowMenu(false);
  };

  return (
    <div
      className={`message-row ${isSentByMe ? 'sent' : 'received'}`}
      onMouseLeave={() => setShowMenu(false)}
    >
      {!isSentByMe && (
        <Avatar
          src={message.sender?.profileImage}
          name={message.sender?.name}
          size="sm"
        />
      )}

      <div style={{ position: 'relative', maxWidth: '100%' }}>
        <div
          className="message-bubble"
          style={{
            fontStyle: isDeleted ? 'italic' : 'normal',
            opacity: isDeleted ? 0.7 : 1,
            position: 'relative',
          }}
        >
          {/* Sender Name in group or received */}
          {!isSentByMe && (
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: '700',
                color: 'var(--accent-emerald)',
                marginBottom: '3px',
              }}
            >
              {message.sender?.name || 'User'}
            </div>
          )}

          {/* Attachment rendering */}
          {!isDeleted && message.attachment && message.attachment.url && (
            <div style={{ marginBottom: message.text ? '8px' : '0' }}>
              {message.messageType === 'image' || message.attachment.fileType?.startsWith('image/') ? (
                <img
                  src={message.attachment.url}
                  alt={message.attachment.fileName || 'Image attachment'}
                  className="message-image-preview"
                  onClick={() => onImageClick(message.attachment.url)}
                />
              ) : (
                <a
                  href={message.attachment.url}
                  download={message.attachment.fileName}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 12px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    color: '#fff',
                    textDecoration: 'none',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <FileText size={22} color="var(--accent-emerald)" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '180px',
                      }}
                    >
                      {message.attachment.fileName || 'Attachment'}
                    </div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>
                      {message.attachment.fileSize
                        ? `${(message.attachment.fileSize / 1024).toFixed(1)} KB`
                        : 'File'}
                    </div>
                  </div>
                  <Download size={16} />
                </a>
              )}
            </div>
          )}

          {/* Message Text */}
          <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
            {isDeleted ? '🚫 This message was deleted' : message.text}
          </div>

          {/* Metadata: Time, Edited status, Read receipts */}
          <div className="message-meta">
            {message.isEdited && !isDeleted && (
              <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>(edited)</span>
            )}
            <span>{formatTime(message.createdAt)}</span>

            {isSentByMe && !isDeleted && (
              <span title={isReadByOther ? 'Read by recipient' : 'Delivered'}>
                {isReadByOther ? (
                  <CheckCheck size={14} color="#6ee7b7" />
                ) : (
                  <Check size={14} color="rgba(255,255,255,0.7)" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Action dropdown button on hover */}
        {!isDeleted && (
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              position: 'absolute',
              top: '4px',
              [isSentByMe ? 'left' : 'right']: '-28px',
              background: 'rgba(22, 31, 51, 0.85)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              zIndex: 5,
              opacity: showMenu ? 1 : 0.6,
              transition: 'all 0.15s ease',
            }}
            title="Message options"
          >
            <MoreVertical size={13} />
          </button>
        )}

        {/* Dropdown Menu */}
        {showMenu && (
          <div
            className="glass-panel"
            style={{
              position: 'absolute',
              top: '30px',
              [isSentByMe ? 'left' : 'right']: '0',
              zIndex: 30,
              borderRadius: 'var(--radius-md)',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              minWidth: '150px',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
            }}
          >
            {message.text && (
              <button
                className="btn btn-secondary"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.8rem',
                  justifyContent: 'flex-start',
                  border: 'none',
                }}
                onClick={handleCopy}
              >
                <Copy size={14} /> Copy Text
              </button>
            )}

            {isSentByMe && (
              <button
                className="btn btn-secondary"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.8rem',
                  justifyContent: 'flex-start',
                  border: 'none',
                }}
                onClick={() => {
                  setShowMenu(false);
                  onEdit(message);
                }}
              >
                <Edit2 size={14} /> Edit Message
              </button>
            )}

            <button
              className="btn btn-danger"
              style={{
                padding: '6px 10px',
                fontSize: '0.8rem',
                justifyContent: 'flex-start',
                border: 'none',
              }}
              onClick={() => {
                setShowMenu(false);
                onDelete(message, isSentByMe);
              }}
            >
              <Trash2 size={14} /> {isSentByMe ? 'Delete Message' : 'Delete for Me'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
