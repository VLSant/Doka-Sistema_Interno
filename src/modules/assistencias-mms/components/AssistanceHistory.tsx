import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import type { AssistanceService } from "../assistance-service";
import type { AssistanceHistoryEvent, HistoryCursor } from "../types";

const EVENT_LABELS: Record<string, string> = {
  importacao: "Importação",
  correcao: "Correção",
  remocao_operacional: "Remoção operacional",
  reativacao: "Reativação",
  exclusao_logica: "Exclusão lógica",
  outro: "Outro evento",
};

export function AssistanceHistory({
  assistanceId,
  service,
}: {
  assistanceId: string;
  service: AssistanceService;
}) {
  const [events, setEvents] = useState<AssistanceHistoryEvent[]>([]);
  const [cursor, setCursor] = useState<HistoryCursor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(
    async (nextCursor: HistoryCursor | null, append = false) => {
      setLoading(true);
      setError("");
      try {
        const page = await service.history(assistanceId, nextCursor);
        setEvents((current) => (append ? [...current, ...page.itens] : page.itens));
        setCursor(page.proximo_cursor);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Não foi possível carregar o histórico.");
      } finally {
        setLoading(false);
      }
    },
    [assistanceId, service],
  );

  // Initial RPC load is the external synchronization performed by this effect.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => void load(null), [load]);

  if (loading && events.length === 0) return <p role="status">Carregando histórico...</p>;
  if (error && events.length === 0) {
    return (
      <div role="alert">
        <p>{error}</p>
        <Button variant="outline" onClick={() => void load(null)}>
          Tentar novamente
        </Button>
      </div>
    );
  }
  if (events.length === 0) return <p>Nenhum evento disponível para esta assistência.</p>;

  return (
    <div>
      <ol className="assistance-history" aria-label="Histórico da assistência">
        {events.map((event) => (
          <li key={event.evento_id}>
            <div className="assistance-history__marker" aria-hidden="true" />
            <div>
              <div className="assistance-history__heading">
                <strong>{EVENT_LABELS[event.tipo] ?? EVENT_LABELS.outro}</strong>
                <time dateTime={event.created_at}>
                  {new Date(event.created_at).toLocaleString("pt-BR")}
                </time>
              </div>
              <p>
                {event.entidade === "parte" && event.parte_conjunto
                  ? `Parte ${event.parte_conjunto}`
                  : "Assistência"}
                {event.campo ? ` · ${event.campo.replaceAll("_", " ")}` : ""}
              </p>
              {event.valor_anterior !== null || event.valor_novo !== null ? (
                <p>
                  <span>{event.valor_anterior || "Não informado"}</span>
                  {" → "}
                  <strong>{event.valor_novo || "Não informado"}</strong>
                </p>
              ) : null}
              {event.justificativa ? <p>Justificativa: {event.justificativa}</p> : null}
              {event.ator ? <p>Por {event.ator.nome}</p> : <p>Origem: importação MMS</p>}
              {event.origem.lote_id ? (
                event.origem.pode_abrir_lote ? (
                  <Link to={`/app/importacoes-mms/${event.origem.lote_id}`}>
                    Abrir lote de origem
                  </Link>
                ) : (
                  <span>Lote de origem indisponível para o escopo atual</span>
                )
              ) : null}
            </div>
          </li>
        ))}
      </ol>
      {cursor ? (
        <Button variant="outline" loading={loading} onClick={() => void load(cursor, true)}>
          Carregar mais eventos
        </Button>
      ) : null}
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
