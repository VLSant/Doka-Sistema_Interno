import * as React from 'react';

/**
 * A KPI tile — big Poppins number with optional delta pill and icon accent.
 * @startingPoint section="Display" subtitle="StatCard — KPI tile with delta" viewport="320x170"
 */
export interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  /** e.g. "12%" */
  delta?: string;
  /** @default 'up' */
  deltaDir?: 'up' | 'down';
  icon?: React.ReactNode;
  /** Icon chip color. @default 'brand' */
  tone?: 'brand' | 'purple' | 'success' | 'info' | 'warning' | 'danger';
  style?: React.CSSProperties;
}

/** A KPI tile — big Poppins number with optional delta pill and icon accent. */
export function StatCard(props: StatCardProps): JSX.Element;
