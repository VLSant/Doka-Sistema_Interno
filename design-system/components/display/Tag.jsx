import React from 'react';

/** Doka Tag — neutral chip for categories/filters, optionally removable. */
export function Tag({ children, onRemove, icon, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 6px 5px 11px',
      borderRadius: 'var(--radius-sm)', background: 'var(--neutral-100)', border: '1px solid var(--border-subtle)',
      fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-body)', ...style,
    }}>
      {icon && <span style={{ display: 'flex', color: 'var(--text-muted)' }}>{icon}</span>}
      {children}
      {onRemove && (
        <button onClick={onRemove} aria-label="Remove" style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18,
          border: 'none', background: 'transparent', borderRadius: 'var(--radius-xs)', cursor: 'pointer', color: 'var(--text-muted)', padding: 0,
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--neutral-200)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
        </button>
      )}
    </span>
  );
}
