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
  | { name: "preview"; preview: ImportPreviewModel }
  | { name: "confirming"; preview: ImportPreviewModel }
  | { name: "result"; result: ImportResultModel }
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
      const preview = await service.prepare(
        parsed,
        context,
        (progress) => setState({ name: "working", progress }),
      );
      setState({ name: "preview", preview });
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
      await service.cancel(state.name === "preview" ? state.preview.loteId : undefined);
    } finally {
      setState({ name: "cancelled" });
    }
  }

  async function handleConfirm(preview: ImportPreviewModel) {
    if (!context || !preview.podeConfirmar) return;
    setState({ name: "confirming", preview });
    try {
      setState({ name: "result", result: await service.confirm(preview.loteId, context) });
    } catch (error) {
      setState({
        name: "failure",
        message: error instanceof Error
          ? error.message
          : "Não foi possível concluir a importação. Tente novamente.",
      });
    }
  }

  const reset = () => setState({ name: "idle" });
  const working = state.name === "working" || state.name === "confirming";

  return (
    <div className="mms-import-page">
      <header className="mms-import-page__heading">
        <div>
          <span className="mms-import-page__eyebrow">Importações MMS</span>
          <h1>Nova Importação MMS</h1>
          <p>Selecione um retrato CSV ou XLSX de um único posto e uma única data.</p>
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
            <ImportPreview preview={state.preview} />
            {state.preview.podeConfirmar ? (
              <div className="mms-confirmation" role="region" aria-labelledby="mms-confirm-title">
                <h2 id="mms-confirm-title">Confirmar atualização do espelho</h2>
                <p>
                  Você confirma o posto <strong>{state.preview.posto.nome}</strong> em{" "}
                  <strong>{state.preview.dataAtividade}</strong>. Registros ausentes podem ser marcados como removidos.
                </p>
                <div className="mms-import-page__actions">
                  <Button variant="outline" disabled={state.name === "confirming"} onClick={handleCancel}>Cancelar</Button>
                  <Button loading={state.name === "confirming"} onClick={() => handleConfirm(state.preview)}>
                    Confirmar importação
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
            <ImportResult result={state.result} />
            <div className="mms-import-page__actions">
              <Button variant="outline" onClick={() => navigate("/app/dashboard")}>Voltar ao Dashboard</Button>
              <Button onClick={reset}>Nova importação</Button>
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
