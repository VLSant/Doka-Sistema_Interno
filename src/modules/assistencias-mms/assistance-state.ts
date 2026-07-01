import type { AssistanceFilters } from "./types";

const FILTER_KEYS = [
  "posto_id",
  "data_de",
  "data_ate",
  "status",
  "tipo",
  "cliente",
  "numero_assistencia",
  "situacao",
] as const;

export function parseAssistanceFilters(params: URLSearchParams): AssistanceFilters {
  const filters: AssistanceFilters = {};
  for (const key of FILTER_KEYS) {
    const value = params.get(key)?.trim();
    if (!value) continue;
    if (key === "situacao") {
      if (value === "ativo" || value === "removido" || value === "todos") {
        filters.situacao = value;
      }
      continue;
    }
    filters[key] = value;
  }
  return filters;
}

export function serializeAssistanceFilters(filters: AssistanceFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = filters[key];
    if (value && !(key === "situacao" && value === "ativo")) {
      params.set(key, value);
    }
  }
  return params;
}

export function hasActiveAssistanceFilters(filters: AssistanceFilters): boolean {
  return FILTER_KEYS.some((key) => {
    const value = filters[key];
    return Boolean(value) && !(key === "situacao" && value === "ativo");
  });
}

export type AssistanceRemoteState =
  | "idle"
  | "loading"
  | "ready"
  | "empty_scope"
  | "empty_filters"
  | "refreshing"
  | "saving"
  | "conflict"
  | "session_expired"
  | "access_denied"
  | "temporary_failure";

export function emptyStateFor(filters: AssistanceFilters): AssistanceRemoteState {
  return hasActiveAssistanceFilters(filters) ? "empty_filters" : "empty_scope";
}
