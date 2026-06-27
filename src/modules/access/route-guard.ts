/**
 * Pure route guard.
 *
 * Implements the mandatory evaluation order from
 * `route-navigation-contract.md` ("Evaluation Order"): confirmed identity ->
 * operational context -> profile permission -> requested posto -> module
 * availability -> authorized. This module performs no network/IO; it only
 * consumes the already-resolved `AuthState` (from `auth-state.ts`) and a
 * `RouteDefinition` (from `app/routes.ts`).
 */
import type { AuthState } from "../auth/auth-state";
import { isProfileAllowedForRoute, type RouteDefinition } from "../../app/routes";
import type { OperationalAccessContext, RouteAccessOutcome } from "./types";

export interface RouteGuardInput {
  /** Current Auth state, owned by `AuthProvider`/`auth-state.ts`. */
  authState: AuthState;
  /** Route definition for the requested path, or `null` for an unknown path. */
  route: RouteDefinition | null;
  /**
   * Optional `posto_id` requested via route/query parameters. Validated
   * against the current context only for non-`escopo_global` profiles
   * (`operational-access-contract.md` "Global scope").
   */
  requestedPostoId?: string | null;
}

function isPostoAuthorized(context: OperationalAccessContext, postoId: string): boolean {
  if (context.escopoGlobal) {
    return true;
  }
  return context.postos.some((posto) => posto.postoId === postoId);
}

/**
 * Evaluates route access for the current navigation following the mandatory
 * order. Never evaluates a later step once an earlier step already produced
 * a terminal outcome, and "denied" (profile/posto) always wins over
 * "unavailable" (module availability) whenever both would otherwise apply.
 */
export function evaluateRouteAccess(input: RouteGuardInput): RouteAccessOutcome {
  const { authState, route, requestedPostoId } = input;

  // Step 1: confirm authenticated identity.
  if (authState.name === "nao_autenticado") {
    return { kind: "sem_sessao" };
  }
  if (authState.name === "expirado") {
    return { kind: "sessao_expirada" };
  }
  if (
    authState.name === "inicializando" ||
    authState.name === "autenticando" ||
    authState.name === "resolvendo_contexto"
  ) {
    // Identity/context not yet settled: never render a decision either way.
    return { kind: "falha_temporaria" };
  }
  if (authState.name === "falha_temporaria") {
    return { kind: "falha_temporaria" };
  }

  // Step 2: resolve current operational context.
  if (authState.name === "bloqueado") {
    return { kind: "contexto_invalido", reason: authState.reason };
  }

  // From here, `authState.name === "autorizado"` and a context exists.
  const context = authState.context;

  // Unknown route (no path matched a definition).
  if (!route) {
    return { kind: "rota_nao_encontrada" };
  }

  // Step 3: check profile permission.
  if (!isProfileAllowedForRoute(route, context.perfil)) {
    return { kind: "acesso_negado" };
  }

  // Step 4: check posto requested by route/query parameters, if any.
  if (requestedPostoId && !isPostoAuthorized(context, requestedPostoId)) {
    return { kind: "acesso_negado" };
  }

  // Step 5: check module availability.
  if (route.availability === "disabled" || route.availability === "placeholder" || route.availability === "hidden") {
    return { kind: "modulo_indisponivel" };
  }

  // Step 6: render the authorized destination.
  return { kind: "autorizado" };
}
