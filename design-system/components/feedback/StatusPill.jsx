import React from 'react';

/**
 * Doka StatusPill — the canonical shipment-status indicator. Maps a status key
 * to brand status color + label. Use everywhere a package state is shown.
 */
const STATUS = {
  delivered:  { label: 'Delivered',   fg: 'var(--green-600)',   bg: 'var(--green-50)',   dot: 'var(--status-delivered)' },
  transit:    { label: 'In transit',  fg: 'var(--blue-600)',    bg: 'var(--blue-50)',    dot: 'var(--status-transit)' },
  out:        { label: 'Out for delivery', fg: 'var(--orange-700)', bg: 'var(--orange-50)', dot: 'var(--orange-500)' },
  delayed:    { label: 'Delayed',     fg: 'var(--amber-600)',   bg: 'var(--amber-50)',   dot: 'var(--status-delayed)' },
  exception:  { label: 'Exception',   fg: 'var(--red-600)',     bg: 'var(--red-50)',     dot: 'var(--status-exception)' },
  pending:    { label: 'Pending',     fg: 'var(--neutral-600)', bg: 'var(--neutral-100)', dot: 'var(--status-pending)' },
};

export function StatusPill({ status = 'pending', label, size = 'md', style }) {
  const s = STATUS[status] || STATUS.pending;
  const sm = size === 'sm';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: sm ? 5 : 6,
      padding: sm ? '3px 9px 3px 8px' : '5px 12px 5px 10px', borderRadius: 'var(--radius-pill)',
      background: s.bg, color: s.fg, fontFamily: 'var(--font-sans)', fontWeight: 700,
      fontSize: sm ? 'var(--text-xs)' : 'var(--text-sm)', lineHeight: 1.3, whiteSpace: 'nowrap', ...style,
    }}>
      <span style={{ width: sm ? 6 : 7, height: sm ? 6 : 7, borderRadius: '50%', background: s.dot, flex: 'none' }} />
      {label || s.label}
    </span>
  );
}
