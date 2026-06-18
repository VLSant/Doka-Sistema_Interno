import React from 'react';

/**
 * Doka Tabs — underline tab nav. `tabs`: [{key,label,count?}].
 * Controlled via `value` + `onChange`.
 */
export function Tabs({ tabs = [], value, onChange, style }) {
  return (
    <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-subtle)', ...style }}>
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <button
            key={t.key} type="button" onClick={() => onChange && onChange(t.key)}
            style={{
              position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '10px 14px 12px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'var(--text-base)',
              color: active ? 'var(--text-strong)' : 'var(--text-muted)',
              transition: 'color var(--dur-fast) var(--ease-standard)',
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-body)'; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            {t.label}
            {t.count != null && (
              <span style={{
                fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 700,
                padding: '1px 7px', borderRadius: 'var(--radius-pill)',
                background: active ? 'var(--orange-50)' : 'var(--neutral-100)',
                color: active ? 'var(--orange-700)' : 'var(--text-muted)',
              }}>{t.count}</span>
            )}
            <span style={{
              position: 'absolute', left: 6, right: 6, bottom: -1, height: 3, borderRadius: '3px 3px 0 0',
              background: 'var(--brand-primary)', transform: active ? 'scaleX(1)' : 'scaleX(0)',
              transition: 'transform var(--dur-base) var(--ease-spring)',
            }} />
          </button>
        );
      })}
    </div>
  );
}
