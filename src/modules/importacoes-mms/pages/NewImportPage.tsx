import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { useAuth } from "../../auth/AuthProvider";
import { ImportPreview } from "../components/ImportPreview";
import { ImportResult } from "../components/ImportResult";
import { FileDropzone } from "../components/FileDropzone";
import { createImportService, type ImportService } from "../import-service";
import { MmsParserError } from "../parser/types";
import type { ImportPreview as ImportPreviewModel, ImportProgress, ImportResult as ImportResultModel } from "../types";
import "./NewImportPage.css";

type PageState =
  | { name: "idle" }
  | { name: "working"; progress: ImportProgress }
  | { name: "preview"; previews: ImportPreviewModel[]; ignoredSourceRows: number[] }
  | { name: "confirming"; previews: ImportPreviewModel[]; ignoredSourceRows: number[] }
  | { name: "result"; results: ImportResultModel[] }
  | { name: "cancelled" }
  | { name: "failure"; message: string };

export interface NewImportPageProps {
  service?: ImportService;
}

export default function NewImportPage({ service: injectedService }: NewImportPageProps) {
  const service = useMemo(() => injectedService ?? createImportService(), [injectedService]);
  const { state: authState } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<PageState>({ name: "idle" });

  const context = authState.name === "autorizado" ? authState.context : null;

  async function handleSelect(file: File) {
    if (!context) return;
    setState({
      name: "working",
      progress: { phase: "parsing", current: 0, total: 1, percentage: 0, message: "Lendo arquivo..." },
    });
    try {
      const parsed = await service.parse(file);
      const previews = await service.prepare(
        parsed,
        context,
        (progress) => setState({ name: "working", progress }),
      );
      setState({
        name: "preview",
        previews,
        ignoredSourceRows: parsed.ignoredAuxiliarySourceRows,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setState({ name: "cancelled" });
        return;
      }
      const message = error instanceof MmsParserError || error instanceof Error
        ? error.message
        : "Não foi possível analisar o arquivo.";
      setState({ name: "failure", message });
    }
  }

  async function handleCancel() {
    try {
      await service.cancel();
    } finally {
      setState({ name: "cancelled" });
    }
  }

  async function handleConfirm(previews: ImportPreviewModel[], ignoredSourceRows: number[]) {
    if (!context || previews.some((preview) => !preview.podeConfirmar)) return;
    setState({ name: "confirming", previews, ignoredSourceRows });
    const results: ImportResultModel[] = [];
    for (const preview of previews) {
      try {
        results.push(await service.confirm(preview.loteId, context));
      } catch (error) {
        results.push({
          loteId: preview.loteId,
          arquivo: preview.arquivo,
          posto: preview.posto.nome,
          dataAtividade: preview.dataAtividade,
          processado: false,
          status: "falha",
          assistenciasCriadas: 0,
          assistenciasAtualizadas: 0,
          assistenciasPreservadas: 0,
          assistenciasRemovidas: 0,
          assistenciasReativadas: 0,
          partesCriadas: 0,
          partesAtualizadas: 0,
          partesPreservadas: 0,
          partesRemovidas: 0,
          partesReativadas: 0,
          linhasInvalidas: preview.linhasInvalidas,
          linhasComAlerta: preview.linhasComAlerta,
          processadoEm: null,
          codigo: "falha_temporaria",
          mensagem: error instanceof Error
            ? error.message
            : "Não foi possível concluir esta área. Tente novamente.",
        });
      }
    }
    setState({ name: "result", results });
  }

  const reset = async () => {
    await service.cancel();
    setState({ name: "idle" });
  };
  const working = state.name === "working" || state.name === "confirming";
  const previews = state.name === "preview" || state.name === "confirming"
    ? state.previews
    : [];
  const allPreviewsEligible = previews.length > 0
    && previews.every((preview) => preview.podeConfirmar);
  const ignoredSourceRows = state.name === "preview" || state.name === "confirming"
    ? state.ignoredSourceRows
    : [];

  return (
    <div className="mms-import-page">
      <header className="mms-import-page__heading">
        <div>
          <span className="mms-import-page__eyebrow">Importações MMS</span>
          <h1>Nova Importação MMS</h1>
          <p>
            Selecione um retrato CSV ou XLSX de uma única data. Áreas de Trabalho
            diferentes serão separadas automaticamente.
          </p>
        </div>
      </header>

      <Card padding="lg">
        {(state.name === "idle" || state.name === "working" || state.name === "failure") ? (
          <FileDropzone
            disabled={working}
            progress={state.name === "working" ? state.progress : null}
            error={state.name === "failure" ? state.message : null}
            onSelect={handleSelect}
            onCancel={working ? handleCancel : undefined}
          />
        ) : null}

        {(state.name === "preview" || state.name === "confirming") ? (
          <div className="mms-import-page__preview">
            {previews.length > 1 ? (
              <p role="status">
                O arquivo foi separado automaticamente em <strong>{previews.length} áreas de trabalho</strong>.
              </p>
            ) : null}
            {ignoredSourceRows.length > 0 ? (
              <p role="status">
                {ignoredSourceRows.length} {ignoredSourceRows.length === 1
                  ? "linha auxiliar sem Área, Tipo e Status foi ignorada"
                  : "linhas auxiliares sem Área, Tipo e Status foram ignoradas"}
                {" "}(linha{ignoredSourceRows.length === 1 ? "" : "s"}{" "}
                {ignoredSourceRows.join(", ")}). O arquivo original permanece preservado.
              </p>
            ) : null}
            {previews.map((preview) => (
              <ImportPreview key={preview.loteId} preview={preview} />
            ))}
            {allPreviewsEligible ? (
              <div className="mms-confirmation" role="region" aria-labelledby="mms-confirm-title">
                <h2 id="mms-confirm-title">Confirmar atualização do espelho</h2>
                <p>
                  Você confirma {previews.length === 1 ? "o posto" : "os postos"}{" "}
                  <strong>{previews.map((preview) => preview.posto.nome).join(", ")}</strong> em{" "}
                  <strong>{previews[0].dataAtividade}</strong>. Registros ausentes podem ser marcados como removidos.
                </p>
                <div className="mms-import-page__actions">
                  <Button variant="outline" disabled={state.name === "confirming"} onClick={handleCancel}>Cancelar</Button>
                  <Button
                    loading={state.name === "confirming"}
                    onClick={() => handleConfirm(previews, ignoredSourceRows)}
                  >
                    {previews.length === 1
                      ? "Confirmar importação"
                      : `Confirmar ${previews.length} importações`}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mms-import-page__actions">
                <p>Corrija o arquivo de origem e inicie uma nova tentativa.</p>
                <Button variant="outline" onClick={handleCancel}>Cancelar tentativa</Button>
              </div>
            )}
          </div>
        ) : null}

        {state.name === "result" ? (
          <div className="mms-import-page__result">
            {state.results.map((result) => (
              <ImportResult key={result.loteId} result={result} />
            ))}
            <div className="mms-import-page__actions">
              <Button variant="outline" onClick={() => navigate("/app/dashboard")}>Voltar ao Dashboard</Button>
              <Button onClick={() => void reset()}>Nova importação</Button>
            </div>
          </div>
        ) : null}

        {state.name === "cancelled" ? (
          <div className="mms-cancelled" role="status">
            <h2>Tentativa cancelada</h2>
            <p>O espelho operacional não foi alterado.</p>
            <Button onClick={reset}>Iniciar nova tentativa</Button>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
