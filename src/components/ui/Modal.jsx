import React, { useEffect, useRef } from 'react';

export default function Modal({ isOpen, onClose, maxWidth = 420, maxHeight = '85vh', padding = 'var(--space-6)', children }) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 17, 21, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'fadeIn var(--duration-base) var(--ease-standard)',
        padding: 'var(--space-5)',
        boxSizing: 'border-box',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding,
          maxWidth,
          width: '100%',
          maxHeight,
          display: 'flex',
          flexDirection: 'column',
          overflow: padding === 0 ? 'hidden' : 'auto',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </div>
  );
}
