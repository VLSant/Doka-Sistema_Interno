import React from 'react';

/** Doka Avatar — image or initials, optional status dot. Plum fallback. */
export function Avatar({ src, name = '', size = 'md', status, style }) {
  const dims = { xs: 24, sm: 32, md: 40, lg: 48, xl: 64 };
  const d = dims[size] || 40;
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const statusColors = { online: 'var(--green-500)', busy: 'var(--red-500)', away: 'var(--amber-500)', offline: 'var(--neutral-400)' };
  return (
    <span style={{ position: 'relative', display: 'inline-flex', flex: 'none', ...style }}>
      <span style={{
        width: d, height: d, borderRadius: '50%', overflow: 'hidden',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--purple-500)', color: '#fff',
        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: d * 0.4,
      }}>
        {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials || '·'}
      </span>
      {status && (
        <span style={{
          position: 'absolute', right: -1, bottom: -1, width: d * 0.28, height: d * 0.28,
          minWidth: 8, minHeight: 8, borderRadius: '50%', background: statusColors[status] || 'var(--neutral-400)',
          border: '2px solid var(--surface-card)',
        }} />
      )}
    </span>
  );
}
