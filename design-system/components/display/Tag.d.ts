import * as React from 'react';

export interface TagProps {
  children?: React.ReactNode;
  /** Show a remove (×) button calling this. */
  onRemove?: () => void;
  icon?: React.ReactNode;
  style?: React.CSSProperties;
}

/** Neutral chip for categories and active filters; optionally removable. */
export function Tag(props: TagProps): JSX.Element;
