import React from 'react';

/**
 * Doka Button — the brand's primary action control.
 * Rounded, confident, with a subtle press-shrink and orange glow on primary hover.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  style,
  ...rest
}) {
  const sizes = {
    sm: { height: 'var(--control-h-sm)', padding: '0 14px', font: 'var(--text-sm)', gap: '6px', radius: 'var(--radius-sm)' },
    md: { height: 'var(--control-h-md)', padding: '0 18px', font: 'var(--text-base)', gap: '8px', radius: 'var(--radius-md)' },
    lg: { height: 'var(--control-h-lg)', padding: '0 24px', font: 'var(--text-md)', gap: '10px', radius: 'var(--radius-md)' },
  };
  const variants = {
    primary: { background: 'var(--brand-primary)', color: 'var(--brand-on-primary)', border: '1px solid transparent' },
    secondary: { background: 'var(--purple-600)', color: '#fff', border: '1px solid transparent' },
    outline: { background: 'transparent', color: 'var(--text-strong)', border: '1px solid var(--border-default)' },
    ghost: { background: 'transparent', color: 'var(--text-body)', border: '1px solid transparent' },
    danger: { background: 'var(--red-500)', color: '#fff', border: '1px solid transparent' },
  };
  const s = sizes[size] || sizes.md;
  const v = variants[variant] || variants.primary;
  const isDisabled = disabled || loading;

  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);

  const hoverBg = {
    primary: 'var(--brand-primary-hover)',
    secondary: 'var(--purple-700)',
    outline: 'var(--neutral-100)',
    ghost: 'var(--neutral-100)',
    danger: 'var(--red-600)',
  }[variant];

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: s.gap, height: s.height, padding: s.padding, width: fullWidth ? '100%' : 'auto',
        fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: s.font, lineHeight: 1,
        borderRadius: s.radius, cursor: isDisabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap', userSelect: 'none',
        transition: 'background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)',
        ...v,
        background: hover && !isDisabled ? hoverBg : v.background,
        boxShadow: variant === 'primary' && hover && !isDisabled ? 'var(--shadow-brand)' : 'none',
        transform: active && !isDisabled ? 'scale(var(--press-scale))' : 'none',
        opacity: isDisabled ? 0.5 : 1,
        ...style,
      }}
      {...rest}
    >
      {loading && <Spinner />}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

function Spinner() {
  return (
    <span style={{
      width: 14, height: 14, borderRadius: '50%',
      border: '2px solid currentColor', borderTopColor: 'transparent',
      display: 'inline-block', animation: 'doka-spin 0.6s linear infinite',
    }}>
      <style>{`@keyframes doka-spin{to{transform:rotate(360deg)}}`}</style>
    </span>
  );
}
