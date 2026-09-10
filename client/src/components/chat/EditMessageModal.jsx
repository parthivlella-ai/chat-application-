import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

const EditMessageModal = ({ isOpen, message, onClose, onSave }) => {
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (message) {
      setEditText(message.text || '');
    }
  }, [message]);

  if (!isOpen || !message) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editText.trim()) {
      onSave(message._id, editText.trim());
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
        <div className="modal-header">
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700' }}>Edit Message</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Message Content</label>
              <textarea
                className="input-control"
                rows={4}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                style={{ resize: 'vertical' }}
                autoFocus
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!editText.trim()}>
              <Check size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMessageModal;
