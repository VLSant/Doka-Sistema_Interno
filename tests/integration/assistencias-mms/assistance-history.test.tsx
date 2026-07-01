import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AssistanceHistory } from "../../../src/modules/assistencias-mms/components/AssistanceHistory";
import {
  assistanceItem,
  assistancePage,
  historyEvent,
} from "../../helpers/assistencias-mms-fixtures";

describe("assistance history", () => {
  it("renders a correction and an authorized source lot link", async () => {
    const service = { history: vi.fn().mockResolvedValue(assistancePage([historyEvent])) };
    render(
      <MemoryRouter>
        <AssistanceHistory
          assistanceId={assistanceItem.assistencia_id}
          service={service as never}
        />
      </MemoryRouter>,
    );
    expect(await screen.findByText("Correção")).toBeVisible();
    expect(screen.getByText("Cliente MMS")).toBeVisible();
    expect(screen.getByRole("link", { name: "Abrir lote de origem" })).toHaveAttribute(
      "href",
      `/app/importacoes-mms/${historyEvent.origem.lote_id}`,
    );
  });
});
