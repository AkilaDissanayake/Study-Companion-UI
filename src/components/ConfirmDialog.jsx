import React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={400}>
      <h3>Confirm Action</h3>
      <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>{message}</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
        <Button variant="secondary" autoFocus onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  );
}
