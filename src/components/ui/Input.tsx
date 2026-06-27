/**
 * Doka Input primitive — typed, accessible adaptation of
 * `design-system/components/forms/Input.jsx`. Always associates label and
 * error/hint text with the control for screen readers.
 */
import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import "./Input.css";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  size?: "sm" | "md" | "lg";
  leftIcon?: ReactNode;
  hint?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Input({
  label,
  size = "md",
  leftIcon,
  hint,
  error,
  disabled = false,
  fullWidth = true,
  id,
  className,
  "aria-describedby": ariaDescribedBy,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy =
    [error ? errorId : hint ? hintId : undefined, ariaDescribedBy].filter(Boolean).join(" ") ||
    undefined;

  const wrapperClasses = ["doka-input", fullWidth ? "doka-input--full" : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className="doka-input__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div
        className={[
          "doka-input__control",
          `doka-input__control--${size}`,
          error ? "doka-input__control--error" : "",
          disabled ? "doka-input__control--disabled" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {leftIcon && <span className="doka-input__icon">{leftIcon}</span>}
        <input
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="doka-input__field"
          {...rest}
        />
      </div>
      {error && (
        <p id={errorId} className="doka-input__message doka-input__message--error">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className="doka-input__message">
          {hint}
        </p>
      )}
    </div>
  );
}
