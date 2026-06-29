import { describe, expect, it } from "vitest";
import {
  clearsProtectedImportData,
  createInitialImportState,
  transitionImportState,
} from "../../../src/modules/importacoes-mms/import-machine";
import { buildImportPreview, buildImportResult } from "../../helpers/importacao-mms-fixtures";

describe("import-machine", () => {
  it("moves through the valid analysis and confirmation journey", () => {
    const preview = buildImportPreview();
    let state = transitionImportState(createInitialImportState(), {
      type: "SELECT_FILE",
      fileName: "valido.csv",
    });
    state = transitionImportState(state, {
      type: "UPLOAD_STARTED",
      loteId: preview.loteId,
    });
    state = transitionImportState(state, { type: "UPLOAD_PROGRESS", progress: 55 });
    state = transitionImportState(state, { type: "STAGING_STARTED", total: 1 });
    state = transitionImportState(state, { type: "STAGING_PROGRESS", sent: 1 });
    state = transitionImportState(state, { type: "PREVIEW_READY", preview });
    state = transitionImportState(state, { type: "CONFIRM" });
    state = transitionImportState(state, {
      type: "COMPLETED",
      result: buildImportResult(),
    });

    expect(state.name).toBe("success");
  });

  it("refuses invalid transitions and confirmation of an ineligible preview", () => {
    const idle = createInitialImportState();
    expect(transitionImportState(idle, { type: "CONFIRM" })).toBe(idle);

    const previewState = {
      name: "preview_ready" as const,
      preview: buildImportPreview({ podeConfirmar: false, status: "erro" }),
    };
    expect(transitionImportState(previewState, { type: "CONFIRM" })).toBe(previewState);
  });

  it("clears protected data on session loss, denial, cancel and reset", () => {
    const preview = { name: "preview_ready" as const, preview: buildImportPreview() };
    expect(clearsProtectedImportData(transitionImportState(preview, { type: "SESSION_EXPIRED" }))).toBe(true);
    expect(clearsProtectedImportData(transitionImportState(preview, { type: "ACCESS_DENIED" }))).toBe(true);
    expect(clearsProtectedImportData(transitionImportState(preview, { type: "CANCELLED" }))).toBe(true);
    expect(clearsProtectedImportData(transitionImportState(preview, { type: "RESET" }))).toBe(true);
  });
});
