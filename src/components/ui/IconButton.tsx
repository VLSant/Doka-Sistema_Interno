/**
 * Doka IconButton primitive — typed adaptation of
 * `design-system/components/forms/IconButton.jsx`. Always requires an
 * accessible label.
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./IconButton.css";

export type IconButtonVariant = "ghost" | "soft" | "primary" | "outline";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  children: ReactNode;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  "aria-label": string;
}

export function IconButton({
  children,
  variant = "ghost",
  size = "md",
  disabled = false,
  className,
  type = "button",
  ...rest
}: IconButtonProps) {
  const classes = [
    "doka-icon-button",
    `doka-icon-button--${variant}`,
    `doka-icon-button--${size}`,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
