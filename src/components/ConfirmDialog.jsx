import React from 'react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', maxWidth: '400px', width: '100%' }}>
        <h3>Confirm Action</h3>
        <p>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button onClick={onClose} style={{ backgroundColor: '#ccc' }}>Cancel</button>
          <button onClick={onConfirm} style={{ backgroundColor: '#dc3545', color: 'white' }}>Delete</button>
        </div>
      </div>
    </div>
  );
}