import React from 'react';

/** Doka Switch — toggle for settings & filters. Orange when on. */
export function Switch({ checked = false, onChange, disabled = false, size = 'md', label, id, style }) {
  const dims = size === 'sm' ? { w: 36, h: 20, k: 14 } : { w: 44, h: 24, k: 18 };
  const toggle = () => { if (!disabled && onChange) onChange(!checked); };
  return (
    <label htmlFor={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }}>
      <span
        role="switch" aria-checked={checked} id={id} onClick={toggle}
        style={{
          width: dims.w, height: dims.h, borderRadius: 'var(--radius-pill)', flex: 'none',
          background: checked ? 'var(--brand-primary)' : 'var(--neutral-300)',
          position: 'relative', transition: 'background var(--dur-base) var(--ease-standard)',
        }}
      >
        <span style={{
          position: 'absolute', top: '50%', left: checked ? dims.w - dims.k - 3 : 3,
          transform: 'translateY(-50%)', width: dims.k, height: dims.k, borderRadius: '50%',
          background: '#fff', boxShadow: 'var(--shadow-sm)',
          transition: 'left var(--dur-base) var(--ease-spring)',
        }} />
      </span>
      {label && <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', color: 'var(--text-strong)', fontWeight: 500 }}>{label}</span>}
    </label>
  );
}
