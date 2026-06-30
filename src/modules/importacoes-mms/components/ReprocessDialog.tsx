import { useRef, useState } from "react";
import { Button } from "../../../components/ui/Button";
import type { TreatmentService } from "../treatment-service";

export function ReprocessDialog({ lotId, version, service, onComplete }: {
  lotId: string; version: number; service: TreatmentService; onComplete: () => void;
}) {
  const key = useRef(crypto.randomUUID());
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  async function confirm() {
    setWorking(true); setMessage("");
    try {
      await service.reprocess(lotId, version, key.current);
      setOpen(false); onComplete();
    } catch {
      try {
        const operation = await service.operation(lotId, key.current);
        if (operation.estado === "concluida") { setOpen(false); onComplete(); return; }
      } catch { /* response remains uncertain */ }
      setMessage("Resposta incerta. Consulte o lote antes de repetir a operação.");
    } finally { setWorking(false); }
  }
  return <>
    <Button onClick={() => setOpen(true)}>Reprocessar</Button>
    {open ? <div role="dialog" aria-modal="true" aria-labelledby="reprocess-title" className="mms-dialog">
      <h2 id="reprocess-title">Confirmar reprocessamento</h2>
      <p>O espelho operacional será atualizado atomicamente com a versão {version}.</p>
      {message ? <p role="alert">{message}</p> : null}
      <Button variant="outline" disabled={working} onClick={() => setOpen(false)}>Cancelar</Button>
      <Button loading={working} onClick={confirm}>Confirmar reprocessamento</Button>
    </div> : null}
  </>;
}
