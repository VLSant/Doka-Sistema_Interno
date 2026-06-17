import * as React from 'react';

/**
 * The base surface — soft plum-tinted shadow, rounded corners.
 * @startingPoint section="Display" subtitle="Card — base surface with optional hover lift" viewport="700x200"
 */
export interface CardProps {
  children?: React.ReactNode;
  /** @default 'md' */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Lifts on hover; use for clickable cards. */
  interactive?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
}

/** The base surface — soft plum-tinted shadow, rounded corners. */
export function Card(props: CardProps): JSX.Element;
