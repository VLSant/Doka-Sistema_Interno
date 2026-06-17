import * as React from 'react';

export interface SwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  /** @default 'md' */
  size?: 'sm' | 'md';
  label?: string;
  id?: string;
  style?: React.CSSProperties;
}

/** Toggle for settings & filters. Orange when on, spring-eased knob. */
export function Switch(props: SwitchProps): JSX.Element;
