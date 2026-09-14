import React from 'react';

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', danger = true, onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p style={{ color: 'var(--text-muted)', marginTop: -8 }}>{message}</p>
        <button className={`btn-primary ${danger ? 'btn-danger' : ''}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
