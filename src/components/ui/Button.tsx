/**
 * Doka Button primitive — typed, accessible adaptation of
 * `design-system/components/forms/Button.jsx` using CSS classes backed by
 * the tokens in `src/styles/design-system.css` instead of inline JS state.
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  fullWidth = false,
  loading = false,
  disabled = false,
  type = "button",
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const classes = [
    "doka-button",
    `doka-button--${variant}`,
    `doka-button--${size}`,
    fullWidth ? "doka-button--full" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} disabled={isDisabled} aria-busy={loading} {...rest}>
      {loading ? <span className="doka-button__spinner" aria-hidden="true" /> : leftIcon}
      <span className="doka-button__label">{children}</span>
      {!loading && rightIcon}
    </button>
  );
}
