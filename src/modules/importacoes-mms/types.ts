import type { JsonSafeValue } from "./parser/types";

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
  | "posto_nao_encontrado"
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
  areaTrabalho?: string | null;
}

export interface ImportPreview {
  loteId: string;
  arquivo: string;
  postos: Array<{ id: string; nome: string }>;
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
  postos: string[];
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

export type ManagementErrorCode =
  | "acesso_negado"
  | "analise_desatualizada"
  | "chave_idempotencia_conflitante"
  | "correcao_desatualizada"
  | "correcao_invalida"
  | "cursor_invalido"
  | "filtros_invalidos"
  | "operacao_em_andamento"
  | "tratamento_incompleto"
  | "falha_temporaria";

export interface ManagementError extends Error {
  code: ManagementErrorCode;
  retryable: boolean;
}

export interface ManagementCursor {
  created_at: string;
  id: string;
}

export interface LotCapabilities {
  abrir: boolean;
  baixar_arquivo: boolean;
  corrigir: boolean;
  concluir_tratamento: boolean;
  reprocessar: boolean;
  analisar_desfazer: boolean;
}

export interface LotFilters {
  posto_id?: string;
  data_atividade?: string;
  importado_de?: string;
  importado_ate?: string;
  status?: string;
  com_erro?: boolean;
  com_alerta?: boolean;
  usuario_importador_id?: string;
}

export interface LotSummary {
  lote_id: string;
  importado_em: string;
  data_atividade: string | null;
  postos: Array<{ id: string; nome: string }>;
  visibilidade_parcial: boolean;
  usuario_importador: { id: string; nome: string } | null;
  arquivo: string | null;
  status: string | null;
  estado_processamento: string;
  total_linhas: number;
  total_assistencias: number;
  total_partes: number;
  total_erros_pendentes: number;
  total_alertas: number;
  precisa_tratamento: boolean;
  capacidades: LotCapabilities;
}

export interface LotDetail extends LotSummary {
  versao_tratamento: number;
  versao_processada: number | null;
  resultado_processamento: Record<string, unknown> | null;
  codigo_ultima_falha: string | null;
  caminho_arquivo: string | null;
  tipo_cancelamento: string | null;
}

export type LotCollection =
  | "linhas"
  | "erros"
  | "alertas"
  | "correcoes"
  | "operacoes"
  | "auditoria";

export interface PaginatedResult<T> {
  itens: T[];
  proximo_cursor: ManagementCursor | null;
}

export interface LotItem {
  id: string;
  created_at: string;
  [key: string]: unknown;
}

export interface CorrectionInput {
  lote_id: string;
  linha_id: string;
  campo: string;
  valor: JsonSafeValue;
  versao_esperada: number;
  justificativa?: string;
}

export interface CorrectionResult {
  correcao_id: string;
  linha_id: string;
  campo: string;
  valor_efetivo: JsonSafeValue;
  versao: number;
  erros_pendentes: number;
}

export interface OperationResult {
  operacao_id: string;
  lote_id: string;
  tipo: "reprocessamento" | "desfazer";
  estado: "em_andamento" | "concluida" | "falha";
  chave_idempotencia: string;
  resultado: Record<string, unknown> | null;
  codigo_falha: string | null;
}

export interface UndoAnalysis {
  lote_id: string;
  elegivel: boolean;
  versao_tratamento: number;
  assinatura_analise: string | null;
  analisado_em: string;
  escopos: Array<{
    posto_id: string;
    data_atividade: string;
    lote_predecessor_id: string | null;
  }>;
  impacto: Record<string, number>;
  motivos_bloqueio: string[];
}
