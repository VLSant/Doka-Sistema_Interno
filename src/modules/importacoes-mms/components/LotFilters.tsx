import type { FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import type { LotFilters as Filters } from "../types";

export function LotFilters({
  value,
  disabled,
  onChange,
}: {
  value: Filters;
  disabled?: boolean;
  onChange: (filters: Filters) => void;
}) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim() || undefined;
    onChange({
      posto_id: text("posto_id"),
      data_atividade: text("data_atividade"),
      importado_de: text("importado_de"),
      importado_ate: text("importado_ate"),
      status: text("status"),
      com_erro: data.get("com_erro") === "on" || undefined,
      com_alerta: data.get("com_alerta") === "on" || undefined,
    });
  }

  return (
    <form className="mms-lot-filters" onSubmit={submit} aria-label="Filtros de importações">
      <label>Posto <input name="posto_id" defaultValue={value.posto_id} /></label>
      <label>Data operacional <input name="data_atividade" type="date" defaultValue={value.data_atividade} /></label>
      <label>Importado de <input name="importado_de" type="date" defaultValue={value.importado_de?.slice(0, 10)} /></label>
      <label>Até <input name="importado_ate" type="date" defaultValue={value.importado_ate?.slice(0, 10)} /></label>
      <label>Status
        <select name="status" defaultValue={value.status ?? ""}>
          <option value="">Todos</option>
          <option value="importado">Importado</option>
          <option value="importado_com_alertas">Com alertas</option>
          <option value="erro">Com erros</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </label>
      <label className="mms-lot-filters__check"><input name="com_erro" type="checkbox" defaultChecked={value.com_erro} /> Com erro</label>
      <label className="mms-lot-filters__check"><input name="com_alerta" type="checkbox" defaultChecked={value.com_alerta} /> Com alerta</label>
      <div className="mms-lot-filters__actions">
        <Button type="submit" disabled={disabled}>Aplicar filtros</Button>
        <Button type="button" variant="outline" disabled={disabled} onClick={() => onChange({})}>Limpar</Button>
      </div>
    </form>
  );
}
