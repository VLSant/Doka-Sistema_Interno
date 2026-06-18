import * as React from 'react';

export interface SelectOption { value: string; label: string; }

export interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<SelectOption | string>;
  placeholder?: string;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  fullWidth?: boolean;
  id?: string;
  style?: React.CSSProperties;
}

/** Compact custom dropdown with brand-styled menu. */
export function Select(props: SelectProps): JSX.Element;
