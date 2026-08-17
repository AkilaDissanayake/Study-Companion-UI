import React, { forwardRef } from 'react';

/**
 * `as` lets a Card render as a real interactive element (e.g. `as="button"`)
 * instead of a `<div>`, so onClick usages get native keyboard/focus support
 * for free instead of needing hand-rolled role/tabIndex/onKeyDown.
 * Forwards its ref to the underlying element so callers can attach an
 * IntersectionObserver (see the .reveal usages in Landing/Overview/Quizzes).
 */
const Card = forwardRef(function Card({ as: Component = 'div', hoverable = false, padding = 'var(--space-6)', style, children, ...rest }, ref) {
  return (
    <Component
      ref={ref}
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
    </Component>
  );
});

export default Card;
