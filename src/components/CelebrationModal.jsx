/**
 * @file CelebrationModal.jsx
 * @description Fires when a newly-unlocked streak milestone or badge comes
 * back from GET /stats/summary (see QuizzesTab.jsx). Ends the moment on a
 * deliberately positive note (the peak-end rule) using the gold accent ramp
 * and bounce easing reserved exclusively for reward moments — see the
 * --color-accent-* / --ease-celebrate tokens in index.css. Pure CSS animation,
 * so it automatically respects the app's prefers-reduced-motion rule.
 */
import React from 'react';
import { PartyPopper } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';

export default function CelebrationModal({ isOpen, onClose, title, description }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth={360}>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: 72,
            height: 72,
            margin: '0 auto',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-accent-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow-accent)',
            animation: 'celebrationPop var(--duration-celebrate) var(--ease-celebrate)',
          }}
        >
          <PartyPopper size={32} color="var(--color-accent-600)" />
        </div>

        <h2 style={{ marginTop: 'var(--space-5)' }}>{title}</h2>
        {description && (
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-2)' }}>{description}</p>
        )}

        <Button fullWidth onClick={onClose} style={{ marginTop: 'var(--space-6)' }}>
          Nice!
        </Button>
      </div>
    </Modal>
  );
}
