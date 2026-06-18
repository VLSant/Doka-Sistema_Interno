import * as React from 'react';

export type ShipmentStatus = 'delivered' | 'transit' | 'out' | 'delayed' | 'exception' | 'pending';

/**
 * The canonical shipment-status indicator — maps a status key to brand color + label.
 * @startingPoint section="Feedback" subtitle="StatusPill — shipment status indicator" viewport="420x80"
 */
export interface StatusPillProps {
  /** @default 'pending' */
  status?: ShipmentStatus;
  /** Override the default label text. */
  label?: string;
  /** @default 'md' */
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

/** The canonical shipment-status indicator — maps a status key to brand color + label. */
export function StatusPill(props: StatusPillProps): JSX.Element;
