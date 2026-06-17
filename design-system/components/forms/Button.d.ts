import * as React from 'react';

/**
 * Props for Doka's primary action control.
 * @startingPoint section="Forms" subtitle="Button — primary / secondary / outline / ghost / danger" viewport="700x120"
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** Visual style. @default 'primary' */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

/**
 * Doka's primary action control — rounded, with press-shrink and an orange glow on primary hover.
 */
export function Button(props: ButtonProps): JSX.Element;
