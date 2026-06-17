import * as React from 'react';

export interface TrackerStep { label: string; sub?: string; }

/**
 * Horizontal stepper for a shipment journey. Completed steps fill orange; active step glows.
 * @startingPoint section="Feedback" subtitle="ProgressTracker — shipment journey stepper" viewport="700x120"
 */
export interface ProgressTrackerProps {
  steps: TrackerStep[];
  /** Index of the active step (0-based). */
  current?: number;
  style?: React.CSSProperties;
}

/** Horizontal stepper for a shipment journey. Completed steps fill orange; active step glows. */
export function ProgressTracker(props: ProgressTrackerProps): JSX.Element;
