import type {
  ImportPreview,
  ImportResult,
  ImportServiceError,
  ImportUiState,
} from "./types";

export type ImportUiEvent =
  | { type: "SELECT_FILE"; fileName: string }
  | { type: "UPLOAD_STARTED"; loteId: string }
  | { type: "UPLOAD_PROGRESS"; progress: number }
  | { type: "STAGING_STARTED"; total: number }
  | { type: "STAGING_PROGRESS"; sent: number }
  | { type: "PREVIEW_READY"; preview: ImportPreview }
  | { type: "CONFIRM" }
  | { type: "COMPLETED"; result: ImportResult }
  | { type: "FAILED"; error: ImportServiceError; loteId?: string }
  | { type: "CANCELLED" }
  | { type: "SESSION_EXPIRED" }
  | { type: "ACCESS_DENIED" }
  | { type: "RESET" };

export function createInitialImportState(): ImportUiState {
  return { name: "idle" };
}

export function transitionImportState(
  state: ImportUiState,
  event: ImportUiEvent,
): ImportUiState {
  if (event.type === "SESSION_EXPIRED") return { name: "session_expired" };
  if (event.type === "ACCESS_DENIED") return { name: "access_denied" };
  if (event.type === "RESET") return { name: "idle" };
  if (event.type === "CANCELLED" && !["success", "success_with_warnings"].includes(state.name)) {
    return { name: "cancelled" };
  }
  if (event.type === "FAILED") {
    return { name: "failure", error: event.error, loteId: event.loteId };
  }

  switch (state.name) {
    case "idle":
      return event.type === "SELECT_FILE"
        ? { name: "parsing", fileName: event.fileName }
        : state;
    case "parsing":
      return event.type === "UPLOAD_STARTED"
        ? { name: "uploading", fileName: state.fileName, loteId: event.loteId, progress: 0 }
        : state;
    case "uploading":
      if (event.type === "UPLOAD_PROGRESS") {
        return { ...state, progress: Math.max(0, Math.min(100, event.progress)) };
      }
      return event.type === "STAGING_STARTED"
        ? { name: "staging", fileName: state.fileName, loteId: state.loteId, sent: 0, total: event.total }
        : state;
    case "staging":
      if (event.type === "STAGING_PROGRESS") {
        return { ...state, sent: Math.max(0, Math.min(state.total, event.sent)) };
      }
      return event.type === "PREVIEW_READY"
        ? { name: "preview_ready", preview: event.preview }
        : state;
    case "preview_ready":
      return event.type === "CONFIRM" && state.preview.podeConfirmar
        ? { name: "confirming", preview: state.preview }
        : state;
    case "confirming":
      if (event.type !== "COMPLETED") return state;
      return event.result.status === "importado_com_alertas"
        ? { name: "success_with_warnings", result: event.result }
        : { name: "success", result: event.result };
    default:
      return state;
  }
}

export function clearsProtectedImportData(state: ImportUiState): boolean {
  return ["idle", "cancelled", "session_expired", "access_denied"].includes(state.name);
}
