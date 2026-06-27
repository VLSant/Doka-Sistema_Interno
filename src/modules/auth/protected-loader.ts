/**
 * Protected-route loader.
 *
 * Confirms Auth + operational context before rendering protected output and
 * redirects unauthenticated/unauthorized users without leaking any
 * protected content (`auth-session-contract.md`, `data-model.md` AuthState).
 *
 * This module intentionally exposes a pure decision function rather than a
 * React Router `loader` callback: the Auth/context state lives in React
 * (`AuthProvider`), not in router loader data, because it must react live to
 * `onAuthStateChange` events without a full navigation. `ProtectedRoute`
 * (in `router.tsx`) consumes this decision on every render.
 *
 * Per US2, every protected navigation also revalidates profile/posto/module
 * availability via `route-guard.ts` (`evaluateRouteAccess`), following the
 * mandatory order from `route-navigation-contract.md`: Auth -> context ->
 * profile -> posto -> availability. This loader never short-circuits that
 * order itself; it only maps the guard's outcome to a router decision.
 */
import { evaluateRouteAccess } from "../access/route-guard";
import type { RouteDefinition } from "../../app/routes";
import type { AuthState } from "./auth-state";

export type ProtectedLoaderDecision =
  | { kind: "render" }
  | {
      kind: "redirect";
      to: "/login" | "/sessao-expirada" | "/falha-temporaria" | "/acesso-negado" | "/configuracao-operacional";
    }
  | { kind: "modulo_indisponivel" }
  | { kind: "rota_nao_encontrada" }
  | { kind: "loading" };

export interface DecideProtectedRouteInput {
  authState: AuthState;
  /** Route definition for the requested path, or `null` for an unknown path. */
  route: RouteDefinition | null;
  /** Optional `posto_id` requested via route/query parameters. */
  requestedPostoId?: string | null;
}

/**
 * Pure function mapping the current Auth state and route to a protected-
 * route decision. Never returns `"render"` unless the underlying outcome is
 * exactly `autorizado` (`isProtectedContentAllowed` invariant, extended here
 * with the full route-guard evaluation).
 */
export function decideProtectedRoute(input: DecideProtectedRouteInput | AuthState): ProtectedLoaderDecision {
  // Backward-compatible overload: a bare `AuthState` (US1 call sites that do
  // not yet pass a route) is treated as "no specific route requested".
  const resolved: DecideProtectedRouteInput =
    "name" in input ? { authState: input, route: null } : input;
  const { authState, route, requestedPostoId } = resolved;

  if (
    authState.name === "inicializando" ||
    authState.name === "autenticando" ||
    authState.name === "resolvendo_contexto"
  ) {
    return { kind: "loading" };
  }

  const outcome = evaluateRouteAccess({ authState, route, requestedPostoId });

  switch (outcome.kind) {
    case "autorizado":
      return { kind: "render" };
    case "sem_sessao":
      return { kind: "redirect", to: "/login" };
    case "sessao_expirada":
      return { kind: "redirect", to: "/sessao-expirada" };
    case "contexto_invalido":
      return { kind: "redirect", to: "/configuracao-operacional" };
    case "acesso_negado":
      return { kind: "redirect", to: "/acesso-negado" };
    case "modulo_indisponivel":
      return { kind: "modulo_indisponivel" };
    case "rota_nao_encontrada":
      return { kind: "rota_nao_encontrada" };
    case "falha_temporaria":
    default:
      return { kind: "redirect", to: "/falha-temporaria" };
  }
}
