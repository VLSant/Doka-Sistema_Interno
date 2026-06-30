import { describe, expect, it } from "vitest";
import { createAssistanceService } from "../../../src/modules/assistencias-mms/assistance-service";
import {
  assistanceItem,
  assistanceRpcClient,
  correctionResult,
} from "../../helpers/assistencias-mms-fixtures";

describe("assistance service correction", () => {
  it("sends entity, allowlisted field, reason and expected version", async () => {
    const mock = assistanceRpcClient({
      corrigir_campo_assistencia_mms: correctionResult,
    });
    await createAssistanceService(mock.client).correctField({
      tipo_entidade: "assistencia",
      entidade_id: assistanceItem.assistencia_id,
      campo: "cliente_nome",
      valor_corrigido: "Cliente novo",
      justificativa: "Confirmado.",
      versao_esperada: 4,
    });
    expect(mock.rpc).toHaveBeenCalledWith("corrigir_campo_assistencia_mms", {
      p_tipo_entidade: "assistencia",
      p_entidade_id: assistanceItem.assistencia_id,
      p_campo: "cliente_nome",
      p_valor_corrigido: "Cliente novo",
      p_justificativa: "Confirmado.",
      p_versao_esperada: 4,
    });
  });

  it("maps a stale correction to its stable code", async () => {
    const mock = assistanceRpcClient({
      corrigir_campo_assistencia_mms: new Error("correcao_desatualizada"),
    });
    await expect(
      createAssistanceService(mock.client).correctField({
        tipo_entidade: "assistencia",
        entidade_id: assistanceItem.assistencia_id,
        campo: "cliente_nome",
        valor_corrigido: "X",
        justificativa: "Y",
        versao_esperada: 4,
      }),
    ).rejects.toMatchObject({ code: "correcao_desatualizada" });
  });
});
