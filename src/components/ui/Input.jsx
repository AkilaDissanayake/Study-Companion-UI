import React from 'react';

const fieldStyle = ({ iconLeft, style }) => ({
  width: '100%',
  padding: iconLeft ? '10px 12px 10px 38px' : '10px 12px',
  margin: 0,
  fontSize: 'var(--font-size-body)',
  fontFamily: 'var(--font-body)',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border-strong)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  boxSizing: 'border-box',
  transition: `border-color var(--duration-base) var(--ease-standard)`,
  ...style,
});

export function Input({ iconLeft, style, ...rest }) {
  if (iconLeft) {
    return (
      <div style={{ position: 'relative', width: '100%' }}>
        <span
          style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            color: 'var(--color-text-tertiary)',
            pointerEvents: 'none',
          }}
        >
          {iconLeft}
        </span>
        <input type="text" style={fieldStyle({ iconLeft, style })} {...rest} />
      </div>
    );
  }
  return <input type="text" style={fieldStyle({ style })} {...rest} />;
}

export function Textarea({ style, ...rest }) {
  return <textarea style={{ ...fieldStyle({ style }), resize: 'vertical' }} {...rest} />;
}

export function Select({ style, children, ...rest }) {
  return (
    <select style={fieldStyle({ style })} {...rest}>
      {children}
    </select>
  );
}
