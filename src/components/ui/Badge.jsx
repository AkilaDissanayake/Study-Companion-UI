import React from 'react';

const TONES = {
  neutral: { bg: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' },
  primary: { bg: 'var(--color-info-bg)', color: 'var(--color-primary-600)' },
  success: { bg: 'var(--color-success-bg)', color: 'var(--color-success)' },
  danger: { bg: 'var(--color-danger-bg)', color: 'var(--color-danger)' },
  warning: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)' },
};

export default function Badge({ tone = 'neutral', icon = null, style, children }) {
  const t = TONES[tone] || TONES.neutral;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        background: t.bg,
        color: t.color,
        fontSize: 'var(--font-size-caption)',
        fontWeight: 600,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {icon}
      {children}
    </span>
  );
}
