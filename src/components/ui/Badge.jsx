import React from 'react';

const TONES = {
  neutral: { bg: 'var(--color-surface-hover)', color: 'var(--color-text-secondary)' },
  primary: { bg: 'var(--color-info-bg)', color: 'var(--color-primary-600)' },
  success: { bg: 'var(--color-success-bg)', color: 'var(--color-success)' },
  danger: { bg: 'var(--color-danger-bg)', color: 'var(--color-danger)' },
  warning: { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)' },
  // Gamification-only tone (badges, streak/milestone chips) — mirrors the
  // accent ramp reserved for celebration moments, see index.css.
  accent: { bg: 'var(--color-accent-100)', color: 'var(--color-accent-700)' },
};

export default function Badge({ tone = 'neutral', icon = null, style, children, ...rest }) {
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
      {...rest}
    >
      {icon}
      {children}
    </span>
  );
}
