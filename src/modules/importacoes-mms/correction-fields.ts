const CORRECTION_FIELDS_BY_CODE: Record<string, string> = {
  area_trabalho_ausente: "area_trabalho",
  data_invalida: "data_atividade",
  numero_assistencia_ausente: "numero_assistencia",
  parte_conjunto_invalida: "parte_conjunto",
  posto_nao_encontrado: "area_trabalho",
  status_atividade_nao_reconhecido: "status_atividade",
  tipo_atividade_nao_reconhecido: "tipo_atividade",
};

const CORRECTION_FIELDS_BY_LABEL: Record<string, string> = {
  "area de trabalho": "area_trabalho",
  data: "data_atividade",
  "data da atividade": "data_atividade",
  "numero da assistencia": "numero_assistencia",
  "parte do conjunto": "parte_conjunto",
  "status da atividade": "status_atividade",
  "tipo de atividade": "tipo_atividade",
};

export function canonicalCorrectionField(field: unknown, code?: unknown): string | null {
  const canonicalFromCode = CORRECTION_FIELDS_BY_CODE[String(code ?? "")];
  if (canonicalFromCode) return canonicalFromCode;
  const normalized = String(field ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
  return CORRECTION_FIELDS_BY_LABEL[normalized] ?? null;
}
