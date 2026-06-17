import * as React from 'react';

export interface AvatarProps {
  src?: string;
  name?: string;
  /** @default 'md' */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'busy' | 'away' | 'offline';
  style?: React.CSSProperties;
}

/** Image or initials avatar with optional status dot. Plum fallback. */
export function Avatar(props: AvatarProps): JSX.Element;
