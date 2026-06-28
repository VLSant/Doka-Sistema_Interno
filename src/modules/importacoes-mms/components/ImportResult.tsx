import type { ImportResult as ImportResultModel } from "../types";
import "./ImportResult.css";

export function ImportResult({ result }: { result: ImportResultModel }) {
  const counters = [
    ["Assistências criadas", result.assistenciasCriadas],
    ["Assistências atualizadas", result.assistenciasAtualizadas],
    ["Assistências preservadas", result.assistenciasPreservadas],
    ["Assistências removidas", result.assistenciasRemovidas],
    ["Assistências reativadas", result.assistenciasReativadas],
    ["Partes criadas", result.partesCriadas],
    ["Partes atualizadas", result.partesAtualizadas],
    ["Partes preservadas", result.partesPreservadas],
    ["Partes removidas", result.partesRemovidas],
    ["Partes reativadas", result.partesReativadas],
  ] as const;
  return (
    <section className={`mms-result mms-result--${result.processado ? "success" : "failure"}`} aria-live="polite">
      <h2>{result.processado ? "Importação concluída" : "Importação não concluída"}</h2>
      <p><strong>Espelho atualizado:</strong> {result.processado ? "Sim" : "Não"}</p>
      <p>Lote {result.loteId} · {result.arquivo} · {result.posto} · {result.dataAtividade}</p>
      {result.processado ? (
        <dl className="mms-result__grid">
          {counters.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
      ) : <p>{result.mensagem ?? "Tente novamente com segurança."}</p>}
    </section>
  );
}
