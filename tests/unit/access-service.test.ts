/**
 * Unit tests for `access-service.ts` operational-context resolution (T042).
 *
 * Covers, per `operational-access-contract.md`: Operador
 * operacional/consulta links, Supervisao supervisao links,
 * Direcao/Administracao global scope, inactive/deleted `usuarios` rows,
 * ambiguous profile configuration, inactive postos, and zero eligible
 * postos.
 */
import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAccessService } from "../../src/modules/access/access-service";
import { mockPostos, mockUsuarios } from "../helpers/supabase-mocks";

interface FakeQueryResult {
  data: unknown;
  error: { message: string } | null;
}

/**
 * Minimal fake Supabase query builder supporting only the subset of
 * `.from().select().eq().is()` chains used by `access-service.ts`.
 */
function buildFakeClient(options: {
  usuariosResult: FakeQueryResult;
  vinculosResult?: FakeQueryResult;
}): SupabaseClient {
  const usuariosBuilder = {
    select: () => usuariosBuilder,
    eq: () => usuariosBuilder,
    is: () => usuariosBuilder,
    then: (resolve: (value: FakeQueryResult) => void) => resolve(options.usuariosResult),
  };

  const vinculosBuilder = {
    select: () => vinculosBuilder,
    eq: () => vinculosBuilder,
    is: () => vinculosBuilder,
    then: (resolve: (value: FakeQueryResult) => void) =>
      resolve(options.vinculosResult ?? { data: [], error: null }),
  };

  const client = {
    from(table: string) {
      if (table === "usuarios") return usuariosBuilder;
      if (table === "usuarios_postos") return vinculosBuilder;
      throw new Error(`Unexpected table in test: ${table}`);
    },
  };

  return client as unknown as SupabaseClient;
}

function vinculoWithPosto(usuarioId: string, postoId: string, nivelAcesso: string) {
  const posto = mockPostos.find((p) => p.id === postoId);
  return {
    usuario_id: usuarioId,
    posto_id: postoId,
    nivel_acesso: nivelAcesso,
    deleted_at: null,
    postos: posto,
  };
}

describe("access-service: resolveInitialContext", () => {
  it("resolves Operador with eligible operacional/consulta links", async () => {
    const usuario = mockUsuarios.operador;
    const client = buildFakeClient({
      usuariosResult: { data: [usuario], error: null },
      vinculosResult: {
        data: [vinculoWithPosto(usuario.id, mockPostos[0].id, "operacional")],
        error: null,
      },
    });
    const service = createAccessService(client);

    const result = await service.resolveInitialContext(usuario.auth_user_id);

    expect(result.status).toBe("autorizado");
    if (result.status === "autorizado") {
      expect(result.context.perfil).toBe("operador");
      expect(result.context.escopoGlobal).toBe(false);
      expect(result.context.postos).toHaveLength(1);
      expect(result.context.postos[0].nivelAcesso).toBe("operacional");
    }
  });

  it("excludes postos with nivel_acesso not eligible for Operador (e.g. supervisao)", async () => {
    const usuario = mockUsuarios.operador;
    const client = buildFakeClient({
      usuariosResult: { data: [usuario], error: null },
      vinculosResult: {
        data: [vinculoWithPosto(usuario.id, mockPostos[0].id, "supervisao")],
        error: null,
      },
    });
    const service = createAccessService(client);

    const result = await service.resolveInitialContext(usuario.auth_user_id);

    expect(result).toEqual({ status: "bloqueado", reason: "sem_posto_autorizado" });
  });

  it("resolves Supervisao with eligible supervisao links", async () => {
    const usuario = mockUsuarios.supervisao;
    const client = buildFakeClient({
      usuariosResult: { data: [usuario], error: null },
      vinculosResult: {
        data: [vinculoWithPosto(usuario.id, mockPostos[0].id, "supervisao")],
        error: null,
      },
    });
    const service = createAccessService(client);

    const result = await service.resolveInitialContext(usuario.auth_user_id);

    expect(result.status).toBe("autorizado");
    if (result.status === "autorizado") {
      expect(result.context.perfil).toBe("supervisao");
      expect(result.context.postos).toHaveLength(1);
      expect(result.context.postos[0].nivelAcesso).toBe("supervisao");
    }
  });

  it("resolves Direcao/Administracao with global scope and no required link", async () => {
    const usuario = mockUsuarios.direcaoAdmin;
    const client = buildFakeClient({
      usuariosResult: { data: [usuario], error: null },
    });
    const service = createAccessService(client);

    const result = await service.resolveInitialContext(usuario.auth_user_id);

    expect(result.status).toBe("autorizado");
    if (result.status === "autorizado") {
      expect(result.context.perfil).toBe("direcao_admin");
      expect(result.context.escopoGlobal).toBe(true);
      expect(result.context.postos).toEqual([]);
    }
  });

  it("blocks an inactive/deleted usuarios row as sem_configuracao_operacional", async () => {
    // The contract query already filters by ativo=true and deleted_at is
    // null, so an inactive/deleted row simply yields zero rows.
    const client = buildFakeClient({
      usuariosResult: { data: [], error: null },
    });
    const service = createAccessService(client);

    const result = await service.resolveInitialContext(mockUsuarios.inativo.auth_user_id);

    expect(result).toEqual({ status: "bloqueado", reason: "sem_configuracao_operacional" });
  });

  it("blocks ambiguous profile configuration when more than one active row matches", async () => {
    const usuario = mockUsuarios.operador;
    const client = buildFakeClient({
      usuariosResult: { data: [usuario, { ...usuario, id: "30000000-0000-0000-0000-000000000099" }], error: null },
    });
    const service = createAccessService(client);

    const result = await service.resolveInitialContext(usuario.auth_user_id);

    expect(result).toEqual({ status: "bloqueado", reason: "configuracao_ambigua" });
  });

  it("excludes vinculos pointing to inactive postos", async () => {
    const usuario = mockUsuarios.operador;
    const inactivePosto = mockPostos.find((p) => !p.ativo);
    if (!inactivePosto) throw new Error("Fixture is missing an inactive posto");

    const client = buildFakeClient({
      usuariosResult: { data: [usuario], error: null },
      vinculosResult: {
        data: [vinculoWithPosto(usuario.id, inactivePosto.id, "operacional")],
        error: null,
      },
    });
    const service = createAccessService(client);

    const result = await service.resolveInitialContext(usuario.auth_user_id);

    expect(result).toEqual({ status: "bloqueado", reason: "sem_posto_autorizado" });
  });

  it("blocks Operador/Supervisao with zero eligible postos", async () => {
    const usuario = mockUsuarios.operador;
    const client = buildFakeClient({
      usuariosResult: { data: [usuario], error: null },
      vinculosResult: { data: [], error: null },
    });
    const service = createAccessService(client);

    const result = await service.resolveInitialContext(usuario.auth_user_id);

    expect(result).toEqual({ status: "bloqueado", reason: "sem_posto_autorizado" });
  });

  it("deduplicates repeated postos by posto_id", async () => {
    const usuario = mockUsuarios.operador;
    const client = buildFakeClient({
      usuariosResult: { data: [usuario], error: null },
      vinculosResult: {
        data: [
          vinculoWithPosto(usuario.id, mockPostos[0].id, "operacional"),
          vinculoWithPosto(usuario.id, mockPostos[0].id, "consulta"),
        ],
        error: null,
      },
    });
    const service = createAccessService(client);

    const result = await service.resolveInitialContext(usuario.auth_user_id);

    expect(result.status).toBe("autorizado");
    if (result.status === "autorizado") {
      expect(result.context.postos).toHaveLength(1);
    }
  });

  it("returns falha_temporaria when the usuarios query errors", async () => {
    const client = buildFakeClient({
      usuariosResult: { data: null, error: { message: "network error" } },
    });
    const service = createAccessService(client);

    const result = await service.resolveInitialContext(mockUsuarios.operador.auth_user_id);

    expect(result).toEqual({ status: "falha_temporaria" });
  });

  it("returns falha_temporaria when the usuarios_postos query errors", async () => {
    const usuario = mockUsuarios.operador;
    const client = buildFakeClient({
      usuariosResult: { data: [usuario], error: null },
      vinculosResult: { data: null, error: { message: "network error" } },
    });
    const service = createAccessService(client);

    const result = await service.resolveInitialContext(usuario.auth_user_id);

    expect(result).toEqual({ status: "falha_temporaria" });
  });
});
