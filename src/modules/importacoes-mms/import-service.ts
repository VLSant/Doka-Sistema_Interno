import type { SupabaseClient } from "@supabase/supabase-js";
import { loadAppEnv } from "../../lib/env";
import { getSupabaseClient } from "../../lib/supabase";
import type { OperationalAccessContext } from "../access/types";
import { parseMmsFile } from "./parser/xlsx-parser";
import { uploadOriginalMmsFile } from "./storage-upload";
import type {
  ImportIssue,
  ImportPreview,
  ImportProgress,
  ImportReservation,
  ImportResult,
  ParsedMmsFile,
  StagingSummary,
} from "./types";

const STAGING_CHUNK_SIZE = 250;

export function chunkStagingRows<T>(rows: T[], size = STAGING_CHUNK_SIZE): T[][] {
  if (!Number.isInteger(size) || size < 1 || size > STAGING_CHUNK_SIZE) {
    throw new Error("Tamanho de bloco inválido.");
  }
  const chunks: T[][] = [];
  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }
  return chunks;
}

interface RpcResponse<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

function requireData<T>(response: RpcResponse<T>, fallback: string): T {
  if (response.error || response.data === null) {
    throw new Error(response.error?.message ?? fallback);
  }
  return response.data;
}

function mapPreview(payload: Record<string, unknown>, issues?: { erros: ImportIssue[]; alertas: ImportIssue[] }): ImportPreview {
  return {
    loteId: String(payload.lote_id),
    arquivo: String(payload.arquivo),
    postos: Array.isArray(payload.postos)
      ? payload.postos as ImportPreview["postos"]
      : [],
    dataAtividade: String(payload.data_atividade),
    status: payload.status as ImportPreview["status"],
    totalLinhas: Number(payload.total_linhas),
    totalAssistencias: Number(payload.total_assistencias),
    totalPartes: Number(payload.total_partes),
    linhasValidas: Number(payload.linhas_validas),
    linhasComAlerta: Number(payload.linhas_com_alerta),
    linhasInvalidas: Number(payload.linhas_invalidas),
    totalErros: Number(payload.total_erros),
    totalAlertas: Number(payload.total_alertas),
    podeConfirmar: payload.pode_confirmar === true,
    erros: issues?.erros ?? [],
    alertas: issues?.alertas ?? [],
  };
}

function issueSourceLine(value: unknown): number | null {
  const relation = Array.isArray(value) ? value[0] : value;
  if (!relation || typeof relation !== "object") return null;
  const line = (relation as { numero_linha_origem?: unknown }).numero_linha_origem;
  return typeof line === "number" && Number.isInteger(line) ? line : null;
}

export function mapImportIssueRows(rows: Array<Record<string, unknown>>): ImportIssue[] {
  return rows.map((row) => ({
    id: String(row.id),
    codigo: String(row.codigo),
    mensagem: String(row.mensagem),
    campo: typeof row.campo === "string" ? row.campo : null,
    linha: issueSourceLine(row.mms_linhas_importacao),
    areaTrabalho: row.contexto && typeof row.contexto === "object"
      && typeof (row.contexto as { area_trabalho?: unknown }).area_trabalho === "string"
      ? (row.contexto as { area_trabalho: string }).area_trabalho
      : null,
  }));
}

export function mapImportResult(payload: Record<string, unknown>): ImportResult {
  if (typeof payload.lote_id !== "string" || typeof payload.processado !== "boolean") {
    throw new Error("Resultado de importação inválido.");
  }
  const counter = (name: string) => {
    const value = Number(payload[name] ?? 0);
    if (!Number.isInteger(value) || value < 0) throw new Error("Resultado de importação inválido.");
    return value;
  };
  return {
    loteId: payload.lote_id,
    arquivo: String(payload.arquivo ?? ""),
    postos: Array.isArray(payload.postos)
      ? payload.postos.map(String)
      : [],
    dataAtividade: String(payload.data_atividade ?? ""),
    processado: payload.processado,
    status: payload.processado
      ? (payload.status as "importado" | "importado_com_alertas")
      : "falha",
    assistenciasCriadas: counter("assistencias_criadas"),
    assistenciasAtualizadas: counter("assistencias_atualizadas"),
    assistenciasPreservadas: counter("assistencias_preservadas"),
    assistenciasRemovidas: counter("assistencias_removidas"),
    assistenciasReativadas: counter("assistencias_reativadas"),
    partesCriadas: counter("partes_criadas"),
    partesAtualizadas: counter("partes_atualizadas"),
    partesPreservadas: counter("partes_preservadas"),
    partesRemovidas: counter("partes_removidas"),
    partesReativadas: counter("partes_reativadas"),
    linhasInvalidas: counter("linhas_invalidas"),
    linhasComAlerta: counter("linhas_com_alerta"),
    processadoEm: typeof payload.processado_em === "string" ? payload.processado_em : null,
    codigo: payload.codigo as ImportResult["codigo"],
    mensagem: typeof payload.mensagem === "string" ? payload.mensagem : undefined,
  };
}

export interface ImportService {
  parse(file: File): Promise<ParsedMmsFile>;
  prepare(
    parsed: ParsedMmsFile,
    context: OperationalAccessContext,
    onProgress?: (progress: ImportProgress) => void,
    signal?: AbortSignal,
  ): Promise<ImportPreview>;
  confirm(loteId: string, context: OperationalAccessContext): Promise<ImportResult>;
  cancel(loteId?: string): Promise<void>;
}

export function createImportService(client: SupabaseClient = getSupabaseClient()): ImportService {
  let currentController: AbortController | null = null;
  let currentLoteId: string | null = null;

  async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
    return requireData(await client.rpc(name, args) as RpcResponse<T>, "Falha temporária na importação.");
  }

  async function fetchIssues(loteId: string): Promise<{ erros: ImportIssue[]; alertas: ImportIssue[] }> {
    const load = async (table: "mms_erros_importacao" | "mms_alertas_importacao") => {
      const { data, error } = await client
        .from(table)
        .select("id,codigo,mensagem,campo,contexto,mms_linhas_importacao(numero_linha_origem)")
        .eq("lote_importacao_id", loteId)
        .is("deleted_at", null)
        .order("created_at")
        .range(0, 99);
      if (error) throw error;
      return mapImportIssueRows((data ?? []) as Array<Record<string, unknown>>);
    };
    const [erros, alertas] = await Promise.all([
      load("mms_erros_importacao"),
      load("mms_alertas_importacao"),
    ]);
    return { erros, alertas };
  }

  async function cancelLot(loteId: string | null, bestEffort = false): Promise<void> {
    if (!loteId) return;
    try {
      await rpc("cancelar_importacao_mms", { p_lote_id: loteId });
    } catch (error) {
      if (!bestEffort) throw error;
    }
    if (currentLoteId === loteId) currentLoteId = null;
  }

  async function prepareSingleLot(
    parsed: ParsedMmsFile,
    onProgress: ((progress: ImportProgress) => void) | undefined,
    signal: AbortSignal,
  ): Promise<ImportPreview> {
    const reservationPayload = await rpc<Record<string, unknown>>("iniciar_importacao_mms", {
      p_nome_origem: parsed.originalName,
      p_extensao: parsed.extension,
      p_mime_type: parsed.mimeType,
      p_tamanho_bytes: parsed.sizeBytes,
      p_data_atividade: parsed.dataAtividade,
      p_total_linhas_esperadas: parsed.totalDataRows,
    });
    const reservation: ImportReservation = {
      loteId: String(reservationPayload.lote_id),
      bucket: "mms-importacoes",
      caminho: String(reservationPayload.caminho),
    };
    currentLoteId = reservation.loteId;

    const { data: sessionData } = await client.auth.getSession();
    const accessToken = sessionData.session?.access_token;
    if (!accessToken) throw new Error("Sua sessão expirou. Entre novamente.");
    const env = loadAppEnv();
    await uploadOriginalMmsFile({
      supabaseUrl: env.supabaseUrl,
      accessToken,
      reservation,
      file: parsed.file,
      signal,
      onProgress: (percentage) => {
        onProgress?.({
          phase: "uploading",
          current: percentage,
          total: 100,
          percentage,
          message: "Enviando arquivo original...",
        });
      },
    });
    await rpc("registrar_arquivo_importacao_mms", { p_lote_id: reservation.loteId });

    let sent = 0;
    for (const parsedChunk of chunkStagingRows(parsed.rows)) {
      if (signal.aborted) throw new DOMException("Importação cancelada.", "AbortError");
      const rows = parsedChunk.map((row) => ({
        numero_linha_origem: row.sourceRowNumber,
        raw_json: row.rawValuesByOriginalHeader,
      }));
      await rpc<StagingSummary>("registrar_linhas_importacao_mms", {
        p_lote_id: reservation.loteId,
        p_linhas: rows,
      });
      sent += rows.length;
      const overall = (sent / parsed.totalDataRows) * 100;
      onProgress?.({
        phase: "staging",
        current: overall,
        total: 100,
        percentage: overall,
        message: `Validando ${sent} de ${parsed.totalDataRows} linhas...`,
      });
    }
    const previewPayload = await rpc<Record<string, unknown>>("concluir_analise_importacao_mms", {
      p_lote_id: reservation.loteId,
    });
    return mapPreview(previewPayload, await fetchIssues(reservation.loteId));
  }

  return {
    parse: parseMmsFile,
    async prepare(parsed, context, onProgress, signal) {
      if (!context.usuarioId) throw new Error("Contexto operacional inválido.");
      currentController?.abort();
      await cancelLot(currentLoteId, true);
      currentController = new AbortController();
      const combinedSignal = signal ?? currentController.signal;
      try {
        return await prepareSingleLot(parsed, onProgress, combinedSignal);
      } catch (error) {
        await cancelLot(currentLoteId, true);
        throw error;
      }
    },
    async confirm(loteId, context) {
      if (!context.usuarioId) throw new Error("Contexto operacional inválido.");
      const payload = await rpc<Record<string, unknown>>("confirmar_importacao_mms", {
        p_lote_id: loteId,
      });
      const result = mapImportResult(payload);
      if (result.processado) {
        currentLoteId = null;
      }
      return result;
    },
    async cancel(loteId) {
      currentController?.abort();
      currentController = null;
      await cancelLot(loteId ?? currentLoteId);
    },
  };
}
