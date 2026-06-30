import { useEffect, useState } from "react";
import type { LotService } from "../lot-service";
import type { LotCollection, LotItem } from "../types";

const COLLECTIONS: Array<{ id: LotCollection; label: string }> = [
  { id: "linhas", label: "Linhas" }, { id: "erros", label: "Erros" },
  { id: "alertas", label: "Alertas" }, { id: "correcoes", label: "Correções" },
  { id: "operacoes", label: "Operações" }, { id: "auditoria", label: "Auditoria" },
];

export function LotItemsTabs({ lotId, service }: { lotId: string; service: LotService }) {
  const [active, setActive] = useState<LotCollection>("linhas");
  const [items, setItems] = useState<LotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    // Reset the tab state before starting the external RPC subscription.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true); setError("");
    void service.items(lotId, active).then((page) => {
      if (live) setItems(page.itens);
    }).catch(() => {
      if (live) setError("Não foi possível carregar esta coleção.");
    }).finally(() => {
      if (live) setLoading(false);
    });
    return () => { live = false; };
  }, [active, lotId, service]);

  return (
    <section className="mms-lot-tabs">
      <div role="tablist" aria-label="Dados do lote">
        {COLLECTIONS.map((collection) => (
          <button key={collection.id} role="tab" aria-selected={active === collection.id} onClick={() => setActive(collection.id)}>
            {collection.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {loading ? <p role="status">Carregando...</p> : null}
        {error ? <p role="alert">{error}</p> : null}
        {!loading && !error && items.length === 0 ? <p>Nenhum registro nesta coleção.</p> : null}
        {!loading && !error && items.length > 0 ? (
          <ul className="mms-lot-items">{items.map((item) => <li key={item.id}><pre>{JSON.stringify(item, null, 2)}</pre></li>)}</ul>
        ) : null}
      </div>
    </section>
  );
}
