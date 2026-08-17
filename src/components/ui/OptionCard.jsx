import React from 'react';
import { Check } from 'lucide-react';

/**
 * A single selectable card within an OptionCard.Group — used for small
 * choice sets (theme, language) instead of a bare <select>.
 */
function Option({ label, description, icon, selected, onSelect }) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${selected ? 'var(--color-primary-500)' : 'var(--color-border)'}`,
        background: selected ? 'var(--color-info-bg)' : 'var(--color-surface)',
        cursor: 'pointer',
        transition: `border-color var(--duration-base) var(--ease-standard), background-color var(--duration-base) var(--ease-standard)`,
      }}
    >
      {icon && <span style={{ display: 'flex', color: 'var(--color-text-secondary)' }}>{icon}</span>}
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontWeight: 600, fontSize: 'var(--font-size-body)', color: 'var(--color-text-primary)' }}>
          {label}
        </div>
        {description && (
          <div style={{ fontSize: 'var(--font-size-body-sm)', color: 'var(--color-text-secondary)' }}>
            {description}
          </div>
        )}
      </div>
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: 'var(--radius-full)',
          border: `1px solid ${selected ? 'var(--color-primary-500)' : 'var(--color-border-strong)'}`,
          background: selected ? 'var(--color-primary-500)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {selected && <Check size={13} color="var(--color-on-primary)" strokeWidth={3} />}
      </span>
    </div>
  );
}

/** Lays out a set of Options in a responsive grid. Pass `value`/`onChange` plus `options`.
 * `columns` is a soft hint (the minimum card width shrinks as it grows), not
 * a hard column count — the grid self-reflows via auto-fit so it never
 * overflows on narrow/mobile widths. */
function Group({ value, onChange, options, columns = 2 }) {
  const minCardWidth = columns >= 3 ? 130 : 160;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`,
        gap: 'var(--space-3)',
      }}
      role="radiogroup"
    >
      {options.map((opt) => (
        <Option
          key={opt.value}
          label={opt.label}
          description={opt.description}
          icon={opt.icon}
          selected={value === opt.value}
          onSelect={() => onChange(opt.value)}
        />
      ))}
    </div>
  );
}

const OptionCard = { Group, Option };
export default OptionCard;
