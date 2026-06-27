/**
 * Initial operational access context lookup.
 *
 * Implements only the lookup required right after a successful login, per
 * `operational-access-contract.md` ("Query Sequence"). The full route guard
 * (profile/posto checks per navigation) is implemented in US2 and is
 * explicitly out of scope here.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseClient } from "../../lib/supabase";
import type {
  NivelAcessoPosto,
  OperationalAccessResult,
  PerfilUsuario,
  PostoAccess,
} from "./types";

interface UsuarioRow {
  id: string;
  auth_user_id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  ativo: boolean;
  deleted_at: string | null;
}

interface VinculoRow {
  usuario_id: string;
  posto_id: string;
  nivel_acesso: NivelAcessoPosto;
  deleted_at: string | null;
  postos: {
    id: string;
    nome: string;
    codigo: string | null;
    ativo: boolean;
    deleted_at: string | null;
  } | null;
}

const OPERADOR_ELIGIBLE_LEVELS: NivelAcessoPosto[] = ["operacional", "consulta"];

function eligibleLevelsForPerfil(perfil: PerfilUsuario): NivelAcessoPosto[] {
  if (perfil === "operador") return OPERADOR_ELIGIBLE_LEVELS;
  if (perfil === "supervisao") return ["supervisao"];
  return [];
}

function toPostoAccess(vinculo: VinculoRow): PostoAccess | null {
  const posto = vinculo.postos;
  if (!posto || !posto.ativo || posto.deleted_at !== null) {
    return null;
  }
  return {
    postoId: posto.id,
    nome: posto.nome,
    codigo: posto.codigo,
    nivelAcesso: vinculo.nivel_acesso,
  };
}

/** Deduplicates postos by `postoId`, keeping the first occurrence. */
function dedupePostos(postos: PostoAccess[]): PostoAccess[] {
  const seen = new Set<string>();
  const result: PostoAccess[] = [];
  for (const posto of postos) {
    if (!seen.has(posto.postoId)) {
      seen.add(posto.postoId);
      result.push(posto);
    }
  }
  return result;
}

export interface AccessService {
  resolveInitialContext(authUserId: string): Promise<OperationalAccessResult>;
}

/**
 * Creates the access service bound to a Supabase client. Defaults to the
 * shared browser client but accepts an injected client for tests.
 */
export function createAccessService(client?: SupabaseClient): AccessService {
  const resolvedClient = client ?? getSupabaseClient();
  return {
    async resolveInitialContext(authUserId: string): Promise<OperationalAccessResult> {
      const { data: usuarios, error: usuarioError } = await resolvedClient
        .from("usuarios")
        .select("id, auth_user_id, nome, email, perfil, ativo, deleted_at")
        .eq("auth_user_id", authUserId)
        .is("deleted_at", null)
        .eq("ativo", true);

      if (usuarioError) {
        return { status: "falha_temporaria" };
      }

      const rows = (usuarios ?? []) as UsuarioRow[];

      if (rows.length === 0) {
        return { status: "bloqueado", reason: "sem_configuracao_operacional" };
      }
      if (rows.length > 1) {
        return { status: "bloqueado", reason: "configuracao_ambigua" };
      }

      const usuario = rows[0];

      if (usuario.perfil === "direcao_admin") {
        return {
          status: "autorizado",
          context: {
            usuarioId: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            perfil: usuario.perfil,
            escopoGlobal: true,
            postos: [],
            carregadoEm: new Date().toISOString(),
          },
        };
      }

      if (usuario.perfil !== "operador" && usuario.perfil !== "supervisao") {
        return { status: "bloqueado", reason: "perfil_invalido" };
      }

      const { data: vinculos, error: vinculoError } = await resolvedClient
        .from("usuarios_postos")
        .select("usuario_id, posto_id, nivel_acesso, deleted_at, postos(id, nome, codigo, ativo, deleted_at)")
        .eq("usuario_id", usuario.id)
        .is("deleted_at", null);

      if (vinculoError) {
        return { status: "falha_temporaria" };
      }

      const eligibleLevels = eligibleLevelsForPerfil(usuario.perfil);
      const rawVinculos = (vinculos ?? []) as unknown as VinculoRow[];
      const postos = dedupePostos(
        rawVinculos
          .filter((vinculo) => eligibleLevels.includes(vinculo.nivel_acesso))
          .map(toPostoAccess)
          .filter((posto): posto is PostoAccess => posto !== null),
      );

      if (postos.length === 0) {
        return { status: "bloqueado", reason: "sem_posto_autorizado" };
      }

      return {
        status: "autorizado",
        context: {
          usuarioId: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
          escopoGlobal: false,
          postos,
          carregadoEm: new Date().toISOString(),
        },
      };
    },
  };
}

let defaultAccessService: AccessService | undefined;

/** Lazily-created default access service bound to the shared browser client. */
export function getAccessService(): AccessService {
  if (!defaultAccessService) {
    defaultAccessService = createAccessService();
  }
  return defaultAccessService;
}
