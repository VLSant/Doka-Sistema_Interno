import React from 'react';

/**
 * Doka Badge — small label/count. `tone` sets the color, `soft` for tinted bg vs solid.
 * tones: neutral | brand | purple | success | info | warning | danger.
 */
export function Badge({ children, tone = 'neutral', soft = true, dot = false, style }) {
  const map = {
    neutral: { solid: 'var(--neutral-700)', soft: 'var(--neutral-100)', softFg: 'var(--neutral-700)' },
    brand: { solid: 'var(--orange-500)', soft: 'var(--orange-50)', softFg: 'var(--orange-700)' },
    purple: { solid: 'var(--purple-500)', soft: 'var(--purple-50)', softFg: 'var(--purple-600)' },
    success: { solid: 'var(--green-500)', soft: 'var(--green-50)', softFg: 'var(--green-600)' },
    info: { solid: 'var(--blue-500)', soft: 'var(--blue-50)', softFg: 'var(--blue-600)' },
    warning: { solid: 'var(--amber-500)', soft: 'var(--amber-50)', softFg: 'var(--amber-600)' },
    danger: { solid: 'var(--red-500)', soft: 'var(--red-50)', softFg: 'var(--red-600)' },
  };
  const c = map[tone] || map.neutral;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: dot ? '3px 9px 3px 7px' : '3px 9px',
      borderRadius: 'var(--radius-pill)', fontFamily: 'var(--font-sans)', fontWeight: 700,
      fontSize: 'var(--text-xs)', lineHeight: 1.4, whiteSpace: 'nowrap',
      background: soft ? c.soft : c.solid, color: soft ? c.softFg : '#fff', ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: soft ? c.solid : '#fff' }} />}
      {children}
    </span>
  );
}
