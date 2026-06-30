import { Button } from "../../../components/ui/Button";
import type { LotDetail } from "../types";

export function LotSummary({
  lot,
  onDownload,
}: {
  lot: LotDetail;
  onDownload: () => void;
}) {
  return (
    <section className="mms-lot-summary" aria-labelledby="lot-summary-title">
      <div><span>Importado em</span><strong>{new Date(lot.importado_em).toLocaleString("pt-BR")}</strong></div>
      <div><span>Status</span><strong>{lot.status ?? lot.estado_processamento}</strong></div>
      <div><span>Arquivo</span><strong>{lot.arquivo ?? "Restrito"}</strong></div>
      <div><span>Postos</span><strong>{lot.postos.map((p) => p.nome).join(", ")}</strong></div>
      <div><span>Linhas</span><strong>{lot.total_linhas}</strong></div>
      <div><span>Assistências / partes</span><strong>{lot.total_assistencias} / {lot.total_partes}</strong></div>
      <div><span>Erros / alertas</span><strong>{lot.total_erros_pendentes} / {lot.total_alertas}</strong></div>
      {lot.capacidades.baixar_arquivo && lot.caminho_arquivo
        ? <Button variant="outline" onClick={onDownload}>Baixar arquivo original</Button>
        : null}
    </section>
  );
}
