import React from 'react';

/** Doka Select — compact dropdown. Options: [{value,label}] or strings. */
export function Select({ label, value, onChange, options = [], placeholder = 'Select…', size = 'md', disabled = false, fullWidth = true, id, style }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const norm = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const current = norm.find((o) => o.value === value);
  const sizes = { sm: 'var(--control-h-sm)', md: 'var(--control-h-md)', lg: 'var(--control-h-lg)' };

  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', width: fullWidth ? '100%' : 'auto', ...style }}>
      {label && <label htmlFor={id} style={{ display: 'block', fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-strong)', marginBottom: 6 }}>{label}</label>}
      <button
        id={id} type="button" disabled={disabled} onClick={() => !disabled && setOpen((o) => !o)}
        style={{
          width: '100%', height: sizes[size] || sizes.md, padding: '0 12px 0 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          background: disabled ? 'var(--neutral-100)' : 'var(--surface-card)',
          border: `1px solid ${open ? 'var(--brand-primary)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-md)', cursor: disabled ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', fontWeight: 500,
          color: current ? 'var(--text-strong)' : 'var(--text-subtle)',
          boxShadow: open ? 'var(--ring)' : 'none', transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{current ? current.label : placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-fast)' }}><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 30,
          background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', padding: 6, maxHeight: 260, overflowY: 'auto',
        }}>
          {norm.map((o) => {
            const sel = o.value === value;
            return (
              <div key={o.value} onClick={() => { onChange && onChange(o.value); setOpen(false); }}
                style={{
                  padding: '9px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', fontWeight: sel ? 700 : 500,
                  color: sel ? 'var(--orange-700)' : 'var(--text-body)', background: sel ? 'var(--orange-50)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
                onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = 'var(--neutral-100)'; }}
                onMouseLeave={(e) => { if (!sel) e.currentTarget.style.background = 'transparent'; }}
              >
                {o.label}
                {sel && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--orange-600)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
