import React from 'react';
import Toast from './Toast';

export default function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 'var(--space-5)',
        right: 'var(--space-5)',
        zIndex: 1100,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        width: '360px',
        maxWidth: 'calc(100vw - var(--space-6))',
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
