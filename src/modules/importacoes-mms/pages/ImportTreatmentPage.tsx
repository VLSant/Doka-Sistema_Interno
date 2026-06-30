import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { FeedbackState } from "../../../components/feedback/FeedbackState";
import { CorrectionEditor } from "../components/CorrectionEditor";
import { ReprocessDialog } from "../components/ReprocessDialog";
import { createLotService, type LotService } from "../lot-service";
import { createTreatmentService, type TreatmentService } from "../treatment-service";
import type { JsonSafeValue, LotDetail, LotItem } from "../types";
import "./ImportListPage.css";

export function ImportTreatmentPage({ lotService: injectedLot, treatmentService: injectedTreatment }: {
  lotService?: LotService; treatmentService?: TreatmentService;
}) {
  const { loteId = "" } = useParams();
  const lotService = useMemo(() => injectedLot ?? createLotService(), [injectedLot]);
  const treatment = useMemo(() => injectedTreatment ?? createTreatmentService(), [injectedTreatment]);
  const [lot, setLot] = useState<LotDetail | null>(null);
  const [errors, setErrors] = useState<LotItem[]>([]);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    try {
      const [detail, page] = await Promise.all([lotService.detail(loteId), lotService.items(loteId, "erros")]);
      setLot(detail); setErrors(page.itens); setMessage("");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Tratamento indisponível."); }
  }, [lotService, loteId]);
  // Initial RPC load is the external synchronization performed by this effect.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, [load]);
  async function conclude() {
    if (!lot) return;
    try { await treatment.conclude(lot.lote_id, lot.versao_tratamento); await load(); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Não foi possível concluir."); }
  }
  if (message && !lot) return <FeedbackState tone="error" title="Tratamento indisponível" description={message} />;
  if (!lot) return <p role="status">Carregando tratamento...</p>;
  return <main className="mms-management">
    <header><Link to={`/app/importacoes-mms/${lot.lote_id}`}>Voltar ao lote</Link><h1>Tratamento da importação</h1>
      <p>{lot.total_erros_pendentes} erro(s) pendente(s), versão {lot.versao_tratamento}.</p></header>
    {message ? <p role="alert">{message}</p> : null}
    <Card padding="lg"><h2>Erros e correções</h2>
      {errors.length === 0 ? <p>Nenhum erro pendente.</p> : <div className="mms-treatment-errors">
        {errors.map((error) => <section key={error.id} aria-labelledby={`error-${error.id}`}>
          <h3 id={`error-${error.id}`}>{String(error.campo ?? "Linha")} — {String(error.codigo ?? "erro_validacao")}</h3>
          <p>{String(error.mensagem ?? "Erro de validação")}</p>
          {lot.capacidades.corrigir && error.linha_importacao_id && error.campo ? <CorrectionEditor
            lotId={lot.lote_id}
            lineId={String(error.linha_importacao_id)}
            field={String(error.campo)}
            original={(error.valor_original ?? null) as JsonSafeValue}
            normalized={(error.valor_normalizado ?? null) as JsonSafeValue}
            current={(error.valor_efetivo ?? "") as JsonSafeValue}
            version={Number(error.versao_correcao ?? 0)}
            service={treatment}
            onSaved={load}
          /> : null}
        </section>)}
      </div>}
    </Card>
    <div>{lot.capacidades.concluir_tratamento ? <Button onClick={conclude}>Concluir tratamento</Button> : null}
      {lot.capacidades.reprocessar ? <ReprocessDialog lotId={lot.lote_id} version={lot.versao_tratamento} service={treatment} onComplete={load} /> : null}</div>
  </main>;
}
export default ImportTreatmentPage;
