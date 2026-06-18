import React from 'react';

/** Doka Checkbox — rounded square, orange when checked. */
export function Checkbox({ checked = false, onChange, disabled = false, label, id, style }) {
  const toggle = () => { if (!disabled && onChange) onChange(!checked); };
  return (
    <label htmlFor={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }}>
      <span
        role="checkbox" aria-checked={checked} id={id} onClick={toggle}
        style={{
          width: 20, height: 20, borderRadius: 'var(--radius-xs)', flex: 'none',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: checked ? 'var(--brand-primary)' : 'var(--surface-card)',
          border: checked ? '1px solid var(--brand-primary)' : '1px solid var(--border-strong)',
          transition: 'background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard)',
        }}
      >
        {checked && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </span>
      {label && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', color: 'var(--text-strong)', fontWeight: 500 }}>{label}</span>}
    </label>
  );
}
