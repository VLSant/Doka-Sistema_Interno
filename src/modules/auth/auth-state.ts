/**
 * Discriminated Auth state machine.
 *
 * State names and transitions follow `data-model.md` ("Application Model:
 * AuthState") exactly. Pure, side-effect-free transition functions only;
 * actual Supabase calls live in `auth-service.ts` (out of scope here).
 */
import type { AccessBlockedReason, OperationalAccessContext } from "../access/types";

export type AuthStateName =
  | "inicializando"
  | "nao_autenticado"
  | "autenticando"
  | "resolvendo_contexto"
  | "autorizado"
  | "bloqueado"
  | "expirado"
  | "falha_temporaria";

export type AuthState =
  | { name: "inicializando" }
  | { name: "nao_autenticado" }
  | { name: "autenticando" }
  | { name: "resolvendo_contexto" }
  | { name: "autorizado"; context: OperationalAccessContext }
  | { name: "bloqueado"; reason: AccessBlockedReason }
  | { name: "expirado" }
  | { name: "falha_temporaria" };

/** Events that can move the Auth state machine. */
export type AuthEvent =
  | { type: "SESSAO_AUSENTE" }
  | { type: "SESSAO_PRESENTE" }
  | { type: "LOGIN_INICIADO" }
  | { type: "LOGIN_FALHOU" }
  | { type: "IDENTIDADE_CONFIRMADA" }
  | { type: "CONTEXTO_RESOLVIDO"; context: OperationalAccessContext }
  | { type: "CONTEXTO_BLOQUEADO"; reason: AccessBlockedReason }
  | { type: "CONTEXTO_FALHOU" }
  | { type: "REVALIDAR_CONTEXTO" }
  | { type: "SESSAO_EXPIROU" }
  | { type: "LOGOUT" };

export function createInitialAuthState(): AuthState {
  return { name: "inicializando" };
}

/** Returns the allowed next-state names for a given current state. */
const ALLOWED_TRANSITIONS: Record<AuthStateName, AuthStateName[]> = {
  inicializando: ["nao_autenticado", "resolvendo_contexto"],
  nao_autenticado: ["autenticando"],
  autenticando: ["resolvendo_contexto", "nao_autenticado"],
  resolvendo_contexto: ["autorizado", "bloqueado", "falha_temporaria"],
  autorizado: ["resolvendo_contexto", "expirado", "nao_autenticado", "bloqueado"],
  bloqueado: [],
  expirado: ["nao_autenticado"],
  falha_temporaria: ["resolvendo_contexto"],
};

function isTransitionAllowed(from: AuthStateName, to: AuthStateName): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

function transitionTo(state: AuthState, next: AuthState): AuthState {
  if (!isTransitionAllowed(state.name, next.name)) {
    return state;
  }
  return next;
}

/**
 * Pure reducer applying one Auth event to the current state. Any transition
 * leaving `autorizado` must be treated by the caller as a signal to clear the
 * operational context and protected content immediately (contract
 * requirement; this function never holds protected content itself).
 */
export function transitionAuthState(state: AuthState, event: AuthEvent): AuthState {
  switch (event.type) {
    case "SESSAO_AUSENTE":
      return transitionTo(state, { name: "nao_autenticado" });
    case "SESSAO_PRESENTE":
      return transitionTo(state, { name: "resolvendo_contexto" });
    case "LOGIN_INICIADO":
      return transitionTo(state, { name: "autenticando" });
    case "LOGIN_FALHOU":
      return transitionTo(state, { name: "nao_autenticado" });
    case "IDENTIDADE_CONFIRMADA":
      return transitionTo(state, { name: "resolvendo_contexto" });
    case "CONTEXTO_RESOLVIDO":
      return transitionTo(state, { name: "autorizado", context: event.context });
    case "CONTEXTO_BLOQUEADO":
      return transitionTo(state, { name: "bloqueado", reason: event.reason });
    case "CONTEXTO_FALHOU":
      return transitionTo(state, { name: "falha_temporaria" });
    case "REVALIDAR_CONTEXTO":
      return transitionTo(state, { name: "resolvendo_contexto" });
    case "SESSAO_EXPIROU":
      return transitionTo(state, { name: "expirado" });
    case "LOGOUT":
      return transitionTo(state, { name: "nao_autenticado" });
    default:
      return state;
  }
}

/** True when protected content may be considered for rendering. */
export function isProtectedContentAllowed(state: AuthState): boolean {
  return state.name === "autorizado";
}
