/**
 * Deterministic operational-access fixtures covering the three official
 * profiles, missing profile, inactive user, and missing posto, mirroring
 * `operational-access-contract.md` and the seed data in
 * `supabase/seed/fundacao_operacional_seed.sql`.
 */
import type { OperationalAccessContext, OperationalAccessResult, PostoAccess } from "../../src/modules/access/types";

const FIXED_CARREGADO_EM = "2026-06-26T12:00:00.000Z";

export function buildPostoAccess(overrides: Partial<PostoAccess> = {}): PostoAccess {
  return {
    postoId: "40000000-0000-0000-0000-000000000001",
    nome: "Posto A",
    codigo: "POSTO_A",
    nivelAcesso: "operacional",
    ...overrides,
  };
}

export function buildOperationalAccessContext(
  overrides: Partial<OperationalAccessContext> = {},
): OperationalAccessContext {
  return {
    usuarioId: "30000000-0000-0000-0000-000000000001",
    nome: "Operador Teste",
    email: "operador@doka.test",
    perfil: "operador",
    escopoGlobal: false,
    postos: [buildPostoAccess()],
    carregadoEm: FIXED_CARREGADO_EM,
    ...overrides,
  };
}

/** Operador with at least one eligible posto (`operacional`/`consulta`). */
export const operadorContext: OperationalAccessContext = buildOperationalAccessContext();

/** Supervisao with at least one eligible posto (`supervisao`). */
export const supervisaoContext: OperationalAccessContext = buildOperationalAccessContext({
  usuarioId: "30000000-0000-0000-0000-000000000002",
  nome: "Supervisao Teste",
  email: "supervisao@doka.test",
  perfil: "supervisao",
  postos: [
    buildPostoAccess({
      postoId: "40000000-0000-0000-0000-000000000001",
      nome: "Posto A",
      codigo: "POSTO_A",
      nivelAcesso: "supervisao",
    }),
    buildPostoAccess({
      postoId: "40000000-0000-0000-0000-000000000002",
      nome: "Posto B",
      codigo: "POSTO_B",
      nivelAcesso: "supervisao",
    }),
  ],
});

/** Direcao/Administracao with global scope and no required link. */
export const direcaoAdminContext: OperationalAccessContext = buildOperationalAccessContext({
  usuarioId: "30000000-0000-0000-0000-000000000003",
  nome: "Direcao Teste",
  email: "direcao@doka.test",
  perfil: "direcao_admin",
  escopoGlobal: true,
  postos: [],
});

/** Authenticated identity with no row in `usuarios` (missing profile). */
export const semConfiguracaoOperacionalResult: OperationalAccessResult = {
  status: "bloqueado",
  reason: "sem_configuracao_operacional",
};

/** Active `usuarios` row but ambiguous mapping (more than one active row). */
export const configuracaoAmbiguaResult: OperationalAccessResult = {
  status: "bloqueado",
  reason: "configuracao_ambigua",
};

/** Operador/Supervisao with zero eligible postos. */
export const semPostoAutorizadoResult: OperationalAccessResult = {
  status: "bloqueado",
  reason: "sem_posto_autorizado",
};

/** Successful resolution helpers, one per official profile. */
export const operadorResult: OperationalAccessResult = { status: "autorizado", context: operadorContext };
export const supervisaoResult: OperationalAccessResult = { status: "autorizado", context: supervisaoContext };
export const direcaoAdminResult: OperationalAccessResult = {
  status: "autorizado",
  context: direcaoAdminContext,
};

/** Auth/context could not be confirmed (network or transient failure). */
export const falhaTemporariaResult: OperationalAccessResult = { status: "falha_temporaria" };
