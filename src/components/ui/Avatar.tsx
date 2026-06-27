/**
 * Doka Avatar primitive — typed adaptation of
 * `design-system/components/display/Avatar.jsx`.
 */
import "./Avatar.css";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarStatus = "online" | "busy" | "away" | "offline";

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ src, name = "", size = "md", status, className }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <span className={["doka-avatar", `doka-avatar--${size}`, className ?? ""].filter(Boolean).join(" ")}>
      <span className="doka-avatar__circle">
        {src ? (
          <img src={src} alt={name} className="doka-avatar__image" />
        ) : (
          <span aria-hidden="true">{initials || "·"}</span>
        )}
      </span>
      {status && (
        <span
          className={`doka-avatar__status doka-avatar__status--${status}`}
          role="status"
          aria-label={status}
        />
      )}
    </span>
  );
}
