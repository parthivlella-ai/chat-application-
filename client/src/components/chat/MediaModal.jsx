import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

const MediaModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ background: 'rgba(0, 0, 0, 0.9)', padding: '20px' }}
    >
      <div
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar actions */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginBottom: '12px',
          }}
        >
          <a
            href={imageUrl}
            download="connectx_attachment"
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Download size={16} /> Download
          </a>
          <button className="btn-icon" onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)' }}>
            <X size={20} color="#fff" />
          </button>
        </div>

        {/* Media View */}
        <img
          src={imageUrl}
          alt="Attachment Full View"
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            objectFit: 'contain',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-color)',
          }}
        />
      </div>
    </div>
  );
};

export default MediaModal;
