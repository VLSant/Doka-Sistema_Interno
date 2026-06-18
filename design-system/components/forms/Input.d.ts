import * as React from 'react';

export interface InputProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  hint?: string;
  error?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  id?: string;
  style?: React.CSSProperties;
}

/** Labelled text field with optional icon, hint and error state. */
export function Input(props: InputProps): JSX.Element;
