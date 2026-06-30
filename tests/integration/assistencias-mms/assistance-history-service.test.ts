import { describe, expect, it } from "vitest";
import { createAssistanceService } from "../../../src/modules/assistencias-mms/assistance-service";
import {
  assistanceItem,
  assistancePage,
  assistanceRpcClient,
  historyEvent,
} from "../../helpers/assistencias-mms-fixtures";

describe("assistance service history", () => {
  it("maps history cursor and page", async () => {
    const mock = assistanceRpcClient({
      listar_historico_assistencia_mms: assistancePage([historyEvent]),
    });
    const result = await createAssistanceService(mock.client).history(
      assistanceItem.assistencia_id,
    );
    expect(result.itens).toEqual([historyEvent]);
    expect(mock.rpc).toHaveBeenCalledWith(
      "listar_historico_assistencia_mms",
      expect.objectContaining({ p_assistencia_id: assistanceItem.assistencia_id }),
    );
  });
});
