import React from 'react';

export default function Avatar({ name, size = 40, style, ...rest }) {
  return (
    <div
      title={name}
      style={{
        width: size,
        height: size,
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-primary-500)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.45,
        fontWeight: 600,
        fontFamily: 'var(--font-display)',
        flexShrink: 0,
        ...style,
      }}
      {...rest}
    >
      {name ? name.charAt(0).toUpperCase() : 'U'}
    </div>
  );
}
