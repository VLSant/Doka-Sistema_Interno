import * as React from 'react';

export interface TabItem { key: string; label: string; count?: number; }

export interface TabsProps {
  tabs: TabItem[];
  value?: string;
  onChange?: (key: string) => void;
  style?: React.CSSProperties;
}

/** Underline tab navigation with optional count chips and a spring-eased indicator. */
export function Tabs(props: TabsProps): JSX.Element;
