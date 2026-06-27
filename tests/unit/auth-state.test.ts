/**
 * Unit tests for the discriminated Auth state machine (T026).
 * Covers initial, login, authorized, logout, expired, blocked, and
 * temporary-failure transitions per `data-model.md` ("Application Model:
 * AuthState").
 */
import { describe, expect, it } from "vitest";
import {
  createInitialAuthState,
  isProtectedContentAllowed,
  transitionAuthState,
} from "../../src/modules/auth/auth-state";
import { operadorContext } from "../helpers/access-fixtures";

describe("auth-state", () => {
  it("starts in inicializando with protected content disallowed", () => {
    const state = createInitialAuthState();
    expect(state).toEqual({ name: "inicializando" });
    expect(isProtectedContentAllowed(state)).toBe(false);
  });

  it("moves from inicializando to nao_autenticado when there is no session", () => {
    const state = transitionAuthState(createInitialAuthState(), { type: "SESSAO_AUSENTE" });
    expect(state).toEqual({ name: "nao_autenticado" });
  });

  it("moves from inicializando directly to resolvendo_contexto when a session exists", () => {
    const state = transitionAuthState(createInitialAuthState(), { type: "SESSAO_PRESENTE" });
    expect(state).toEqual({ name: "resolvendo_contexto" });
  });

  it("login: nao_autenticado -> autenticando -> resolvendo_contexto -> autorizado", () => {
    let state = transitionAuthState(createInitialAuthState(), { type: "SESSAO_AUSENTE" });
    state = transitionAuthState(state, { type: "LOGIN_INICIADO" });
    expect(state).toEqual({ name: "autenticando" });

    state = transitionAuthState(state, { type: "IDENTIDADE_CONFIRMADA" });
    expect(state).toEqual({ name: "resolvendo_contexto" });

    state = transitionAuthState(state, { type: "CONTEXTO_RESOLVIDO", context: operadorContext });
    expect(state).toEqual({ name: "autorizado", context: operadorContext });
    expect(isProtectedContentAllowed(state)).toBe(true);
  });

  it("login failure returns to nao_autenticado", () => {
    let state = transitionAuthState(createInitialAuthState(), { type: "SESSAO_AUSENTE" });
    state = transitionAuthState(state, { type: "LOGIN_INICIADO" });
    state = transitionAuthState(state, { type: "LOGIN_FALHOU" });
    expect(state).toEqual({ name: "nao_autenticado" });
  });

  it("logout from autorizado clears to nao_autenticado", () => {
    const authorized = { name: "autorizado" as const, context: operadorContext };
    const state = transitionAuthState(authorized, { type: "LOGOUT" });
    expect(state).toEqual({ name: "nao_autenticado" });
    expect(isProtectedContentAllowed(state)).toBe(false);
  });

  it("expiration from autorizado moves to expirado, then back to nao_autenticado", () => {
    const authorized = { name: "autorizado" as const, context: operadorContext };
    let state = transitionAuthState(authorized, { type: "SESSAO_EXPIROU" });
    expect(state).toEqual({ name: "expirado" });
    expect(isProtectedContentAllowed(state)).toBe(false);

    state = transitionAuthState(state, { type: "SESSAO_AUSENTE" });
    expect(state).toEqual({ name: "nao_autenticado" });
  });

  it("allows re-login directly from expirado without requiring a reload", () => {
    const expired = { name: "expirado" as const };
    let state = transitionAuthState(expired, { type: "LOGIN_INICIADO" });
    expect(state).toEqual({ name: "autenticando" });

    state = transitionAuthState(state, { type: "IDENTIDADE_CONFIRMADA" });
    expect(state).toEqual({ name: "resolvendo_contexto" });

    state = transitionAuthState(state, { type: "CONTEXTO_RESOLVIDO", context: operadorContext });
    expect(state).toEqual({ name: "autorizado", context: operadorContext });
    expect(isProtectedContentAllowed(state)).toBe(true);
  });

  it("blocked context from resolvendo_contexto stores the blocked reason", () => {
    const state = transitionAuthState(
      { name: "resolvendo_contexto" },
      { type: "CONTEXTO_BLOQUEADO", reason: "sem_posto_autorizado" },
    );
    expect(state).toEqual({ name: "bloqueado", reason: "sem_posto_autorizado" });
    expect(isProtectedContentAllowed(state)).toBe(false);
  });

  it("logout always clears blocked and temporary-failure states", () => {
    const blocked = { name: "bloqueado" as const, reason: "sem_configuracao_operacional" as const };
    expect(transitionAuthState(blocked, { type: "LOGOUT" })).toEqual({ name: "nao_autenticado" });
    expect(transitionAuthState({ name: "falha_temporaria" }, { type: "LOGOUT" })).toEqual({
      name: "nao_autenticado",
    });
  });

  it("temporary failure from resolvendo_contexto can retry back into resolvendo_contexto", () => {
    let state = transitionAuthState({ name: "resolvendo_contexto" }, { type: "CONTEXTO_FALHOU" });
    expect(state).toEqual({ name: "falha_temporaria" });

    state = transitionAuthState(state, { type: "REVALIDAR_CONTEXTO" });
    expect(state).toEqual({ name: "resolvendo_contexto" });
  });

  it("revalidation from autorizado clears the previous context value on the new state", () => {
    const authorized = { name: "autorizado" as const, context: operadorContext };
    const state = transitionAuthState(authorized, { type: "REVALIDAR_CONTEXTO" });
    expect(state).toEqual({ name: "resolvendo_contexto" });
    expect(isProtectedContentAllowed(state)).toBe(false);
  });

  it("ignores transitions disallowed by the contract (e.g. nao_autenticado -> autorizado directly)", () => {
    const state = transitionAuthState(
      { name: "nao_autenticado" },
      { type: "CONTEXTO_RESOLVIDO", context: operadorContext },
    );
    expect(state).toEqual({ name: "nao_autenticado" });
  });
});
