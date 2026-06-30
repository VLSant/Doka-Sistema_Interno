export type AssistanceStatus = "ativo" | "removido";
export type AssistanceSituationFilter = AssistanceStatus | "todos";
export type EffectiveValueOrigin = "importacao" | "correcao" | "ausente";
export type CorrectableEntity = "assistencia" | "parte";
export type CorrectableField = "cliente_nome" | "endereco" | "descricao_mercadoria" | "recurso";

export type AssistanceErrorCode =
  | "acesso_negado"
  | "campo_nao_corrigivel"
  | "correcao_desatualizada"
  | "cursor_invalido"
  | "falha_temporaria"
  | "filtros_invalidos"
  | "justificativa_obrigatoria"
  | "registro_removido"
  | "valor_invalido"
  | "vinculo_somente_consulta";

export interface AssistanceError extends Error {
  code: AssistanceErrorCode;
  retryable: boolean;
}

export interface AssistanceFilters {
  posto_id?: string;
  data_de?: string;
  data_ate?: string;
  status?: string;
  tipo?: string;
  cliente?: string;
  numero_assistencia?: string;
  situacao?: AssistanceSituationFilter;
}

export interface AssistanceCursor {
  data_atividade: string;
  id: string;
}

export interface HistoryCursor {
  created_at: string;
  id: string;
}

export interface PaginatedResult<T, C> {
  itens: T[];
  proximo_cursor: C | null;
}

export interface PostoSummary {
  id: string;
  nome: string;
}

export interface AssistanceListItem {
  assistencia_id: string;
  numero_assistencia: string;
  posto: PostoSummary;
  data_atividade: string;
  cliente: string | null;
  tipo: string | null;
  status: string | null;
  situacao: AssistanceStatus;
  total_partes_ativas: number;
  total_partes: number;
  versao_registro: number;
}

export interface EffectiveValue {
  importado: string | null;
  corrigido: string | null;
  vigente: string | null;
  origem_vigente: EffectiveValueOrigin;
}

export interface ImportOrigin {
  lote_criacao_id: string;
  linha_criacao_id: string | null;
  lote_ultimo_id: string;
  linha_ultima_id: string | null;
}

export interface AssistancePart {
  parte_id: string;
  parte_conjunto: string;
  situacao: AssistanceStatus;
  status: string | null;
  tipo_original: string | null;
  tipo: string | null;
  descricao_mercadoria: EffectiveValue;
  recurso: EffectiveValue;
  origem: ImportOrigin;
  versao_registro: number;
  pode_corrigir: boolean;
}

export interface AssistanceDetail {
  assistencia_id: string;
  numero_assistencia: string;
  posto: PostoSummary;
  data_atividade: string;
  status: string | null;
  tipo_original: string | null;
  tipo: string | null;
  situacao: AssistanceStatus;
  cliente: EffectiveValue;
  endereco: EffectiveValue;
  origem: ImportOrigin;
  versao_registro: number;
  capacidades: {
    corrigir_assistencia: boolean;
    consultar_historico: boolean;
  };
  partes_removidas_ocultas: number;
  partes: AssistancePart[];
}

export interface CorrectionInput {
  tipo_entidade: CorrectableEntity;
  entidade_id: string;
  campo: CorrectableField;
  valor_corrigido: string;
  justificativa: string;
  versao_esperada: number;
}

export interface CorrectionResult extends EffectiveValue {
  tipo_entidade: CorrectableEntity;
  entidade_id: string;
  campo: CorrectableField;
  versao_registro: number;
  corrigido_em: string;
  corrigido_por: PostoSummary;
}

export type HistoryEventType =
  | "importacao"
  | "correcao"
  | "remocao_operacional"
  | "reativacao"
  | "exclusao_logica"
  | "outro";

export interface AssistanceHistoryEvent {
  evento_id: string;
  created_at: string;
  tipo: HistoryEventType;
  acao: string;
  entidade: CorrectableEntity;
  entidade_id: string;
  parte_conjunto: string | null;
  campo: CorrectableField | null;
  valor_anterior: string | null;
  valor_novo: string | null;
  justificativa: string | null;
  ator: PostoSummary | null;
  origem: {
    lote_id: string | null;
    linha_id: string | null;
    pode_abrir_lote: boolean;
  };
}
