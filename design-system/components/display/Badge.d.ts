import * as React from 'react';

export interface BadgeProps {
  children?: React.ReactNode;
  /** @default 'neutral' */
  tone?: 'neutral' | 'brand' | 'purple' | 'success' | 'info' | 'warning' | 'danger';
  /** Tinted bg (true) vs solid fill. @default true */
  soft?: boolean;
  /** Leading status dot. */
  dot?: boolean;
  style?: React.CSSProperties;
}

/** Small pill label or count. Use `dot` for status, `soft={false}` for solid emphasis. */
export function Badge(props: BadgeProps): JSX.Element;
