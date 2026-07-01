import { describe, expect, it } from "vitest";
import { createAssistanceService } from "../../../src/modules/assistencias-mms/assistance-service";
import {
  assistanceItem,
  assistancePage,
  assistanceRpcClient,
} from "../../helpers/assistencias-mms-fixtures";

describe("assistance service list", () => {
  it("maps filters and caps page size", async () => {
    const mock = assistanceRpcClient({
      listar_assistencias_mms: assistancePage([assistanceItem]),
    });
    const result = await createAssistanceService(mock.client).list(
      { numero_assistencia: "008", situacao: "todos" },
      null,
      500,
    );
    expect(result.itens).toEqual([assistanceItem]);
    expect(mock.rpc).toHaveBeenCalledWith(
      "listar_assistencias_mms",
      expect.objectContaining({
        p_filtros: { numero_assistencia: "008", situacao: "todos" },
        p_limite: 100,
      }),
    );
  });

  it("maps database details to a neutral failure", async () => {
    const mock = assistanceRpcClient({
      listar_assistencias_mms: new Error("internal detail"),
    });
    await expect(createAssistanceService(mock.client).list()).rejects.toMatchObject({
      code: "falha_temporaria",
    });
  });
});
