/**
 * Doka Card primitive — typed adaptation of
 * `design-system/components/display/Card.jsx`.
 */
import type { HTMLAttributes } from "react";
import "./Card.css";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

export function Card({ padding = "md", interactive = false, className, children, ...rest }: CardProps) {
  const classes = [
    "doka-card",
    `doka-card--padding-${padding}`,
    interactive ? "doka-card--interactive" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
