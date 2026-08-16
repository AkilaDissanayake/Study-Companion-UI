import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import IconButton from './IconButton';
import Button from './Button';

const TONE_CONFIG = {
  success: { color: 'var(--color-success)', Icon: CheckCircle2 },
  error: { color: 'var(--color-danger)', Icon: XCircle },
  warning: { color: 'var(--color-warning)', Icon: AlertTriangle },
  info: { color: 'var(--color-info)', Icon: Info },
};

export default function Toast({ toast, onDismiss }) {
  const { id, type, message, retry, exiting } = toast;
  const { color, Icon } = TONE_CONFIG[type] || TONE_CONFIG.info;

  return (
    <div
      role="status"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-3)',
        background: 'var(--color-surface)',
        border: `1px solid ${color}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-md)',
        padding: 'var(--space-4)',
        animation: `${exiting ? 'toastOut' : 'toastIn'} var(--duration-base) var(--ease-standard) forwards`,
      }}
    >
      <Icon size={18} color={color} style={{ flexShrink: 0, marginTop: 2 }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-primary)', wordBreak: 'break-word' }}>
          {message}
        </p>

        {retry && (
          <div style={{ marginTop: 'var(--space-3)' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                retry();
                onDismiss(id);
              }}
            >
              Retry
            </Button>
          </div>
        )}
      </div>

      <IconButton
        size={28}
        icon={<X size={14} />}
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
      />
    </div>
  );
}
