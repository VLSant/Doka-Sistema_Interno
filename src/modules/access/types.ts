/**
 * Operational access types.
 *
 * Mirrors `operational-access-contract.md`, `route-navigation-contract.md`,
 * and the `data-model.md` Application Models. These types describe access
 * derived exclusively from `usuarios`, `usuarios_postos`, and `postos` under
 * RLS. They never originate from `user_metadata`.
 */

/** Official profiles defined by Spec 001 (`public.perfil_usuario`). */
export type PerfilUsuario = "operador" | "supervisao" | "direcao_admin";

/** Access levels defined by Spec 001 (`public.nivel_acesso_posto`). */
export type NivelAcessoPosto = "operacional" | "supervisao" | "consulta";

/** A single posto the current user can access, with its granted level. */
export interface PostoAccess {
  postoId: string;
  nome: string;
  codigo?: string | null;
  nivelAcesso: NivelAcessoPosto;
}

/**
 * Operational access context derived from confirmed Auth identity plus the
 * RLS-governed `usuarios`/`usuarios_postos`/`postos` rows.
 */
export interface OperationalAccessContext {
  usuarioId: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  escopoGlobal: boolean;
  postos: PostoAccess[];
  carregadoEm: string;
}

/**
 * Internal discriminated reasons an operational context failed to resolve.
 * Only `operational-access-contract.md` reasons are used; the UI must group
 * sensitive reasons into a single neutral PT-BR message.
 */
export type AccessBlockedReason =
  | "sem_configuracao_operacional"
  | "configuracao_ambigua"
  | "perfil_invalido"
  | "sem_posto_autorizado";

/** Result of resolving the operational access context. */
export type OperationalAccessResult =
  | { status: "autorizado"; context: OperationalAccessContext }
  | { status: "bloqueado"; reason: AccessBlockedReason }
  | { status: "falha_temporaria" };

/**
 * Route availability state, as defined by `route-navigation-contract.md`.
 */
export type RouteAvailability = "available" | "placeholder" | "disabled" | "hidden";

/**
 * Outcome of evaluating route access for the current navigation, following
 * the mandatory evaluation order: identity -> context -> profile -> posto ->
 * availability.
 */
export type RouteAccessOutcome =
  | { kind: "sem_sessao" }
  | { kind: "sessao_expirada" }
  | { kind: "contexto_invalido"; reason: AccessBlockedReason }
  | { kind: "acesso_negado" }
  | { kind: "modulo_indisponivel" }
  | { kind: "rota_nao_encontrada" }
  | { kind: "falha_temporaria" }
  | { kind: "autorizado" };
