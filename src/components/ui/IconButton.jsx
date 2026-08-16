import React from 'react';

const VARIANTS = {
  ghost: {
    idleBg: 'transparent',
    hoverBg: 'var(--color-surface-hover)',
    idleColor: 'var(--color-text-secondary)',
    hoverColor: 'var(--color-text-primary)',
  },
  outline: {
    idleBg: 'var(--color-surface)',
    hoverBg: 'var(--color-surface-hover)',
    idleColor: 'var(--color-text-secondary)',
    hoverColor: 'var(--color-text-primary)',
  },
  sidebar: {
    idleBg: 'transparent',
    hoverBg: 'var(--color-sidebar-surface-hover)',
    idleColor: 'var(--color-sidebar-text-muted)',
    hoverColor: 'var(--color-sidebar-text)',
  },
};

export default function IconButton({
  icon,
  size = 36,
  variant = 'ghost',
  active = false,
  style,
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.ghost;
  const background = active ? v.hoverBg : v.idleBg;

  return (
    <button
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        padding: 0,
        margin: 0,
        borderRadius: 'var(--radius-md)',
        border: variant === 'outline' ? '1px solid var(--color-border-strong)' : 'none',
        background,
        color: active ? v.hoverColor : v.idleColor,
        cursor: 'pointer',
        transition: `background-color var(--duration-base) var(--ease-standard), color var(--duration-base) var(--ease-standard)`,
        boxSizing: 'border-box',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = v.hoverBg;
        e.currentTarget.style.color = v.hoverColor;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = background;
        e.currentTarget.style.color = active ? v.hoverColor : v.idleColor;
      }}
      {...rest}
    >
      {icon}
    </button>
  );
}
