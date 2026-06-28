import { describe, expect, it } from "vitest";
import {
  createInitialImportState,
  transitionImportState,
} from "../../../src/modules/importacoes-mms/import-machine";
import { buildImportPreview } from "../../helpers/importacao-mms-fixtures";

describe("MMS cancellation/session cleanup", () => {
  it("cancels local parsing and resets to a fresh attempt", () => {
    const parsing = transitionImportState(createInitialImportState(), {
      type: "SELECT_FILE",
      fileName: "mms.csv",
    });
    const cancelled = transitionImportState(parsing, { type: "CANCELLED" });
    expect(cancelled.name).toBe("cancelled");
    expect(transitionImportState(cancelled, { type: "RESET" })).toEqual({ name: "idle" });
  });

  it("clears a protected preview when the session expires", () => {
    const preview = { name: "preview_ready" as const, preview: buildImportPreview() };
    expect(transitionImportState(preview, { type: "SESSION_EXPIRED" })).toEqual({
      name: "session_expired",
    });
  });
});
