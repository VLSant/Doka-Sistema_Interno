/**
 * Reusable Doka-branded loading indicator.
 * Used whenever protected content/App Shell must stay hidden while Auth or
 * the operational context is still resolving (`auth-session-contract.md`).
 */
import "./LoadingState.css";

export interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Carregando..." }: LoadingStateProps) {
  return (
    <div className="doka-loading-state" role="status" aria-live="polite">
      <span className="doka-loading-state__spinner" aria-hidden="true" />
      <p className="doka-loading-state__message">{message}</p>
    </div>
  );
}
