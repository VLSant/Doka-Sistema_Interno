import { describe, expect, it } from "vitest";
import { createAssistanceService } from "../../../src/modules/assistencias-mms/assistance-service";
import { assistanceDetail, assistanceRpcClient } from "../../helpers/assistencias-mms-fixtures";

describe("assistance service detail", () => {
  it("requests the grouped detail with removed parts when selected", async () => {
    const mock = assistanceRpcClient({
      obter_detalhe_assistencia_mms: assistanceDetail,
    });
    const result = await createAssistanceService(mock.client).detail(
      assistanceDetail.assistencia_id,
      true,
    );
    expect(result).toEqual(assistanceDetail);
    expect(mock.rpc).toHaveBeenCalledWith("obter_detalhe_assistencia_mms", {
      p_assistencia_id: assistanceDetail.assistencia_id,
      p_incluir_partes_removidas: true,
    });
  });
});
