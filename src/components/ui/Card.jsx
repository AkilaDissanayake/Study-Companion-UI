import React from 'react';

export default function Card({ hoverable = false, padding = 'var(--space-6)', style, children, ...rest }) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding,
        boxShadow: 'var(--shadow-xs)',
        transition: `box-shadow var(--duration-base) var(--ease-standard), border-color var(--duration-base) var(--ease-standard)`,
        boxSizing: 'border-box',
        ...style,
      }}
      onMouseEnter={
        hoverable
          ? (e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              e.currentTarget.style.borderColor = 'var(--color-border-strong)';
            }
          : undefined
      }
      onMouseLeave={
        hoverable
          ? (e) => {
              e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
              e.currentTarget.style.borderColor = 'var(--color-border)';
            }
          : undefined
      }
      {...rest}
    >
      {children}
    </div>
  );
}
