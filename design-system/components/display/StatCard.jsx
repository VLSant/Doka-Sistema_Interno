import React from 'react';

/**
 * Doka StatCard — a KPI tile. Big Poppins number, optional delta and icon accent.
 * `tone` colors the icon chip: brand | purple | success | info | warning | danger.
 */
export function StatCard({ label, value, unit, delta, deltaDir = 'up', icon, tone = 'brand', style }) {
  const tones = {
    brand: { bg: 'var(--orange-50)', fg: 'var(--orange-600)' },
    purple: { bg: 'var(--purple-50)', fg: 'var(--purple-500)' },
    success: { bg: 'var(--green-50)', fg: 'var(--green-600)' },
    info: { bg: 'var(--blue-50)', fg: 'var(--blue-600)' },
    warning: { bg: 'var(--amber-50)', fg: 'var(--amber-600)' },
    danger: { bg: 'var(--red-50)', fg: 'var(--red-600)' },
  };
  const t = tones[tone] || tones.brand;
  const positive = deltaDir === 'up';
  return (
    <div style={{
      background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-card)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)',
      display: 'flex', flexDirection: 'column', gap: 14, ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{label}</span>
        {icon && (
          <span style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: t.bg, color: t.fg, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-4xl)', lineHeight: 1, color: 'var(--text-strong)', letterSpacing: '-0.02em' }}>{value}</span>
        {unit && <span style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 'var(--text-lg)', color: 'var(--text-muted)' }}>{unit}</span>}
      </div>
      {delta != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 'var(--radius-pill)',
            fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: 'var(--text-xs)',
            background: positive ? 'var(--green-50)' : 'var(--red-50)', color: positive ? 'var(--green-600)' : 'var(--red-600)',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: positive ? 'none' : 'rotate(180deg)' }}><path d="m6 15 6-6 6 6" /></svg>
            {delta}
          </span>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', color: 'var(--text-subtle)' }}>vs last week</span>
        </div>
      )}
    </div>
  );
}
