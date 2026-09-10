import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image, Smile, X, Loader2 } from 'lucide-react';
import { useChat } from '../../context/ChatContext';

const QUICK_EMOJIS = ['👍', '❤️', '🔥', '😂', '🚀', '✨', '🎉', '👏', '🙌', '💯'];

const MessageInput = () => {
  const [text, setText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showEmojiBar, setShowEmojiBar] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { sendMessage, emitTypingStart, emitTypingStop } = useChat();

  // Focus input on mount or chat switch
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);

    // Emit typing start
    emitTypingStart();

    // Debounce typing stop (1.5s after last keystroke)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStop();
    }, 1500);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed && !selectedFile) return;

    setIsSending(true);
    emitTypingStop();
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    try {
      await sendMessage({
        text: trimmed,
        file: selectedFile,
        messageType: selectedFile ? (selectedFile.type.startsWith('image/') ? 'image' : 'file') : 'text',
      });

      setText('');
      removeSelectedFile();
      setShowEmojiBar(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="chat-input-area">
      {/* File attachment preview bar */}
      {selectedFile && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '10px',
            padding: '8px 14px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                background: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              📎
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedFile.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {(selectedFile.size / 1024).toFixed(1)} KB
            </div>
          </div>
          <button
            type="button"
            onClick={removeSelectedFile}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--accent-rose)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Quick Emojis Bar */}
      {showEmojiBar && (
        <div
          style={{
            display: 'flex',
            gap: '6px',
            padding: '8px 12px',
            marginBottom: '8px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
            overflowX: 'auto',
          }}
        >
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => addEmoji(emoji)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: '4px',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.target.style.transform = 'scale(1.25)')}
              onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="chat-input-form">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Attachment Button */}
        <button
          type="button"
          className="btn-icon"
          title="Attach file or image"
          onClick={() => fileInputRef.current?.click()}
          style={{ width: '36px', height: '36px' }}
        >
          <Paperclip size={18} />
        </button>

        {/* Emoji Button */}
        <button
          type="button"
          className="btn-icon"
          title="Quick emojis"
          onClick={() => setShowEmojiBar(!showEmojiBar)}
          style={{ width: '36px', height: '36px', color: showEmojiBar ? 'var(--accent-amber)' : 'var(--text-muted)' }}
        >
          <Smile size={18} />
        </button>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message... (Enter to send)"
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          disabled={isSending}
        />

        {/* Send Button */}
        <button
          type="submit"
          className="btn btn-primary"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            padding: 0,
            flexShrink: 0,
            opacity: !text.trim() && !selectedFile ? 0.6 : 1,
          }}
          disabled={isSending || (!text.trim() && !selectedFile)}
        >
          {isSending ? (
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
