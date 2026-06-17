import * as React from 'react';

export interface IconButtonProps {
  children?: React.ReactNode;
  /** @default 'ghost' */
  variant?: 'ghost' | 'soft' | 'primary' | 'outline';
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  'aria-label': string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}

/** Square rounded icon action for toolbars and table rows. Pass a Lucide <svg> as children. */
export function IconButton(props: IconButtonProps): JSX.Element;
