import { describe, expect, it } from "vitest";
import { createLotService } from "../../../src/modules/importacoes-mms/lot-service";
import { lotSummary, rpcClient } from "../../helpers/importacao-mms-management-fixtures";

describe("lot management service", () => {
  it("maps filters, cursor and safe page response", async () => {
    const mock = rpcClient({
      listar_lotes_importacao_mms: { itens: [lotSummary], proximo_cursor: null },
    });
    const service = createLotService(mock.client);
    const result = await service.list({ status: "erro", com_erro: true }, null, 200);
    expect(result.itens).toEqual([lotSummary]);
    expect(mock.rpc).toHaveBeenCalledWith("listar_lotes_importacao_mms", expect.objectContaining({
      p_filtros: { status: "erro", com_erro: true },
      p_limite: 100,
    }));
  });

  it("rejects an invalid cursor before calling the RPC", async () => {
    const mock = rpcClient({});
    const service = createLotService(mock.client);
    await expect(service.list({}, { created_at: "invalid", id: "invalid" })).rejects.toMatchObject({
      code: "cursor_invalido",
    });
    expect(mock.rpc).not.toHaveBeenCalled();
  });

  it("maps database details to a neutral temporary failure", async () => {
    const mock = rpcClient({ listar_lotes_importacao_mms: new Error("internal connection detail") });
    await expect(createLotService(mock.client).list()).rejects.toMatchObject({
      code: "falha_temporaria",
      message: "Não foi possível concluir a operação. Tente novamente.",
    });
  });
});
