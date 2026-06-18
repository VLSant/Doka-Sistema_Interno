import * as React from 'react';

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
  style?: React.CSSProperties;
}

/** Rounded-square checkbox, orange when checked. */
export function Checkbox(props: CheckboxProps): JSX.Element;
