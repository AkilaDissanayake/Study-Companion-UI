import React from 'react';

export default function EmptyState({ icon, title, description, action = null }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: 'var(--space-9) var(--space-6)',
        color: 'var(--color-text-secondary)',
        gap: 'var(--space-2)',
      }}
    >
      {icon && (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-surface-hover)',
            color: 'var(--color-text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-2)',
          }}
        >
          {icon}
        </div>
      )}
      <h3 style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
      {description && (
        <p style={{ margin: 0, fontSize: 'var(--font-size-body-sm)', maxWidth: 320 }}>{description}</p>
      )}
      {action && <div style={{ marginTop: 'var(--space-3)' }}>{action}</div>}
    </div>
  );
}
