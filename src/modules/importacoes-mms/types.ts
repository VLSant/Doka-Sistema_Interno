export type {
  JsonSafeValue,
  MmsFileExtension,
  ParsedMmsAreaGroup,
  ParsedMmsFile,
  ParsedMmsRow,
  ParserErrorCode,
} from "./parser/types";

export type ImportStableErrorCode =
  | "arquivo_incompativel"
  | "estrutura_incompativel"
  | "coluna_obrigatoria_ausente"
  | "cabecalho_duplicado"
  | "multiplas_datas"
  | "data_invalida"
  | "area_trabalho_ausente"
  | "posto_nao_encontrado_ou_inacessivel"
  | "numero_assistencia_ausente"
  | "parte_conjunto_invalida"
  | "status_atividade_nao_reconhecido"
  | "tipo_atividade_nao_reconhecido"
  | "linha_duplicada_conflitante"
  | "arquivo_storage_inconsistente"
  | "lote_incompleto"
  | "sessao_expirada"
  | "acesso_negado"
  | "falha_processamento"
  | "falha_temporaria";

export interface ImportIssue {
  id?: string;
  linha?: number | null;
  campo?: string | null;
  codigo: string;
  mensagem: string;
  valorOriginal?: unknown;
  valorNormalizado?: unknown;
}

export interface ImportPreview {
  loteId: string;
  arquivo: string;
  posto: { id: string; nome: string };
  dataAtividade: string;
  status: "importado" | "importado_com_alertas" | "erro";
  totalLinhas: number;
  totalAssistencias: number;
  totalPartes: number;
  linhasValidas: number;
  linhasComAlerta: number;
  linhasInvalidas: number;
  totalErros: number;
  totalAlertas: number;
  podeConfirmar: boolean;
  erros: ImportIssue[];
  alertas: ImportIssue[];
}

export interface ImportResult {
  loteId: string;
  arquivo: string;
  posto: string;
  dataAtividade: string;
  processado: boolean;
  status: "importado" | "importado_com_alertas" | "falha";
  assistenciasCriadas: number;
  assistenciasAtualizadas: number;
  assistenciasPreservadas: number;
  assistenciasRemovidas: number;
  assistenciasReativadas: number;
  partesCriadas: number;
  partesAtualizadas: number;
  partesPreservadas: number;
  partesRemovidas: number;
  partesReativadas: number;
  linhasInvalidas: number;
  linhasComAlerta: number;
  processadoEm: string | null;
  codigo?: ImportStableErrorCode;
  mensagem?: string;
}

export interface ImportProgress {
  phase: "parsing" | "uploading" | "staging" | "confirming";
  current: number;
  total: number;
  percentage: number;
  message: string;
}

export interface ImportReservation {
  loteId: string;
  bucket: "mms-importacoes";
  caminho: string;
}

export interface StagingSummary {
  loteId: string;
  recebidas: number;
  criadas: number;
  preservadas: number;
  totalLinhasAtual: number;
}

export interface ImportServiceError {
  code: ImportStableErrorCode;
  message: string;
  retryable: boolean;
}

export type ImportUiState =
  | { name: "idle" }
  | { name: "parsing"; fileName: string }
  | { name: "uploading"; fileName: string; loteId: string; progress: number }
  | { name: "staging"; fileName: string; loteId: string; sent: number; total: number }
  | { name: "preview_ready"; preview: ImportPreview }
  | { name: "confirming"; preview: ImportPreview }
  | { name: "success"; result: ImportResult }
  | { name: "success_with_warnings"; result: ImportResult }
  | { name: "cancelled" }
  | { name: "session_expired" }
  | { name: "access_denied" }
  | { name: "failure"; error: ImportServiceError; loteId?: string };
