import React from 'react';

/**
 * Doka Input — labelled text field with optional icon, hint and error state.
 */
export function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  size = 'md',
  leftIcon,
  hint,
  error,
  disabled = false,
  fullWidth = true,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const sizes = {
    sm: { height: 'var(--control-h-sm)', font: 'var(--text-sm)' },
    md: { height: 'var(--control-h-md)', font: 'var(--text-base)' },
    lg: { height: 'var(--control-h-lg)', font: 'var(--text-md)' },
  };
  const s = sizes[size] || sizes.md;
  const borderColor = error ? 'var(--red-500)' : focus ? 'var(--brand-primary)' : 'var(--border-default)';

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto', ...style }}>
      {label && (
        <label htmlFor={id} style={{
          display: 'block', fontFamily: 'var(--font-sans)', fontWeight: 600,
          fontSize: 'var(--text-sm)', color: 'var(--text-strong)', marginBottom: 6,
        }}>{label}</label>
      )}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, height: s.height, padding: '0 14px',
        background: disabled ? 'var(--neutral-100)' : 'var(--surface-card)',
        border: `1px solid ${borderColor}`, borderRadius: 'var(--radius-md)',
        boxShadow: focus && !error ? 'var(--ring)' : 'none',
        transition: 'border-color var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
      }}>
        {leftIcon && <span style={{ display: 'flex', color: 'var(--text-muted)', flex: 'none' }}>{leftIcon}</span>}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: 'var(--font-sans)', fontSize: s.font, color: 'var(--text-strong)',
          }}
          {...rest}
        />
      </div>
      {(hint || error) && (
        <div style={{
          marginTop: 6, fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)',
          color: error ? 'var(--red-600)' : 'var(--text-muted)',
        }}>{error || hint}</div>
      )}
    </div>
  );
}
