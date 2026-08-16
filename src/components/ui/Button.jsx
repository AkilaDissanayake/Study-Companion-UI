import React from 'react';

const VARIANT_STYLES = {
  primary: {
    background: 'var(--color-primary-500)',
    hoverBackground: 'var(--color-primary-600)',
    color: '#ffffff',
    border: '1px solid transparent',
  },
  secondary: {
    background: 'var(--color-surface)',
    hoverBackground: 'var(--color-surface-hover)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border-strong)',
  },
  ghost: {
    background: 'transparent',
    hoverBackground: 'var(--color-surface-hover)',
    color: 'var(--color-text-secondary)',
    border: '1px solid transparent',
  },
  danger: {
    background: 'var(--color-danger)',
    hoverBackground: 'var(--color-danger)',
    color: '#ffffff',
    border: '1px solid transparent',
  },
  'danger-secondary': {
    background: 'var(--color-surface)',
    hoverBackground: 'var(--color-danger-bg)',
    color: 'var(--color-danger)',
    border: '1px solid var(--color-border-strong)',
  },
};

const SIZE_STYLES = {
  sm: { padding: '6px 12px', fontSize: 'var(--font-size-body-sm)', gap: 'var(--space-2)' },
  md: { padding: '10px 16px', fontSize: 'var(--font-size-body)', gap: 'var(--space-2)' },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  iconLeft = null,
  isLoading = false,
  fullWidth = false,
  disabled = false,
  style,
  children,
  ...rest
}) {
  const v = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const s = SIZE_STYLES[size] || SIZE_STYLES.md;
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        width: fullWidth ? '100%' : 'auto',
        padding: s.padding,
        fontSize: s.fontSize,
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        margin: 0,
        borderRadius: 'var(--radius-md)',
        background: v.background,
        color: v.color,
        border: v.border,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: `background-color var(--duration-base) var(--ease-standard), border-color var(--duration-base) var(--ease-standard)`,
        boxSizing: 'border-box',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) e.currentTarget.style.backgroundColor = v.hoverBackground;
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) e.currentTarget.style.backgroundColor = v.background;
      }}
      {...rest}
    >
      {iconLeft}
      {isLoading ? 'Loading…' : children}
    </button>
  );
}
