import React from 'react';

/** Doka Card — the base surface. Soft plum-tinted shadow, rounded, optional padding & hover lift. */
export function Card({ children, padding = 'md', interactive = false, style, onClick, ...rest }) {
  const pads = { none: 0, sm: 'var(--space-4)', md: 'var(--space-6)', lg: 'var(--space-7)' };
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
      style={{
        background: 'var(--surface-card)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-card)', padding: pads[padding] ?? pads.md,
        boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hover ? 'translateY(var(--hover-lift))' : 'none',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
