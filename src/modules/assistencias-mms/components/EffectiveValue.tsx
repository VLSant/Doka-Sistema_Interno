import { Button } from "../../../components/ui/Button";
import type { EffectiveValue as EffectiveValueModel } from "../types";

export function EffectiveValue({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: EffectiveValueModel;
  onEdit?: () => void;
}) {
  const originLabel =
    value.origem_vigente === "correcao"
      ? "Valor corrigido"
      : value.origem_vigente === "importacao"
        ? "Valor importado"
        : "Sem valor";

  return (
    <div className="effective-value">
      <div className="effective-value__heading">
        <div>
          <span className="effective-value__label">{label}</span>
          <strong>{value.vigente || "Não informado"}</strong>
        </div>
        <span className={`assistance-badge assistance-badge--${value.origem_vigente}`}>
          {originLabel}
        </span>
      </div>
      <details>
        <summary>Ver origem do valor</summary>
        <dl>
          <dt>Importado da MMS</dt>
          <dd>{value.importado || "Não informado"}</dd>
          <dt>Corrigido no Doka</dt>
          <dd>{value.corrigido || "Sem correção"}</dd>
        </dl>
      </details>
      {onEdit ? (
        <Button size="sm" variant="outline" onClick={onEdit}>
          Corrigir {label.toLocaleLowerCase("pt-BR")}
        </Button>
      ) : null}
    </div>
  );
}
