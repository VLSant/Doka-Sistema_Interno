import { useEffect, useRef, useState } from "react";
import { Button } from "../../../components/ui/Button";
import type { AssistanceService } from "../assistance-service";
import type {
  CorrectableEntity,
  CorrectableField,
  CorrectionResult,
  EffectiveValue,
} from "../types";

export interface CorrectionTarget {
  entityType: CorrectableEntity;
  entityId: string;
  field: CorrectableField;
  label: string;
  value: EffectiveValue;
  version: number;
}

export function AssistanceCorrectionDialog({
  target,
  service,
  onClose,
  onSaved,
}: {
  target: CorrectionTarget;
  service: AssistanceService;
  onClose: () => void;
  onSaved: (result: CorrectionResult) => void;
}) {
  const [value, setValue] = useState(target.value.vigente ?? "");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const valueRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    valueRef.current?.focus();

    return () => previousFocus?.focus();
  }, []);

  function handleDialogKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" && !saving) {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function save() {
    if (!value.trim()) {
      setMessage("Informe o novo valor.");
      return;
    }
    if (!reason.trim()) {
      setMessage("Informe uma justificativa.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const result = await service.correctField({
        tipo_entidade: target.entityType,
        entidade_id: target.entityId,
        campo: target.field,
        valor_corrigido: value,
        justificativa: reason,
        versao_esperada: target.version,
      });
      onSaved(result);
    } catch (error) {
      const code = (error as { code?: string }).code;
      setMessage(
        code === "correcao_desatualizada"
          ? "Este valor foi alterado por outra pessoa. Seu texto foi preservado; feche, recarregue e revise antes de salvar."
          : error instanceof Error
            ? error.message
            : "Não foi possível salvar a correção.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="assistance-dialog-backdrop">
      <section
        ref={dialogRef}
        className="assistance-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistance-correction-title"
        onKeyDown={handleDialogKeyDown}
      >
        <h2 id="assistance-correction-title">Corrigir {target.label.toLocaleLowerCase("pt-BR")}</h2>
        <dl>
          <dt>Importado da MMS</dt>
          <dd>{target.value.importado || "Não informado"}</dd>
          <dt>Valor vigente</dt>
          <dd>{target.value.vigente || "Não informado"}</dd>
        </dl>
        <label>
          Novo valor
          <input
            ref={valueRef}
            value={value}
            disabled={saving}
            onChange={(event) => setValue(event.target.value)}
          />
        </label>
        <label>
          Justificativa
          <textarea
            value={reason}
            disabled={saving}
            maxLength={1000}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        {message ? <p role="alert">{message}</p> : null}
        <div className="assistance-dialog__actions">
          <Button variant="outline" disabled={saving} onClick={onClose}>
            Cancelar
          </Button>
          <Button loading={saving} onClick={() => void save()}>
            Confirmar correção
          </Button>
        </div>
      </section>
    </div>
  );
}
