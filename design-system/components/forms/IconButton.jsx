import React from 'react';

/**
 * Doka IconButton — square, rounded action for toolbars and table rows.
 * Pass an icon element (e.g. a Lucide <svg>) as children.
 */
export function IconButton({
  children,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  'aria-label': ariaLabel,
  onClick,
  style,
  ...rest
}) {
  const sizes = { sm: 32, md: 40, lg: 48 };
  const dim = sizes[size] || 40;
  const variants = {
    ghost: { background: 'transparent', color: 'var(--text-body)' },
    soft: { background: 'var(--neutral-100)', color: 'var(--text-strong)' },
    primary: { background: 'var(--brand-primary)', color: '#fff' },
    outline: { background: 'transparent', color: 'var(--text-strong)', border: '1px solid var(--border-default)' },
  };
  const v = variants[variant] || variants.ghost;
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const hoverBg = { ghost: 'var(--neutral-100)', soft: 'var(--neutral-150)', primary: 'var(--brand-primary-hover)', outline: 'var(--neutral-100)' }[variant];

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        width: dim, height: dim, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 'var(--radius-md)', border: '1px solid transparent', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',
        ...v,
        background: hover && !disabled ? hoverBg : v.background,
        transform: active && !disabled ? 'scale(var(--press-scale))' : 'none',
        opacity: disabled ? 0.45 : 1,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
