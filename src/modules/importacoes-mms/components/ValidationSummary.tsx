import type { ImportPreview } from "../types";
import "./ValidationSummary.css";

export function ValidationSummary({ preview }: { preview: ImportPreview }) {
  const metrics = [
    ["Linhas", preview.totalLinhas],
    ["Assistências", preview.totalAssistencias],
    ["Partes", preview.totalPartes],
    ["Válidas", preview.linhasValidas],
    ["Com alerta", preview.linhasComAlerta],
    ["Inválidas", preview.linhasInvalidas],
    ["Erros", preview.totalErros],
    ["Alertas", preview.totalAlertas],
  ] as const;
  return (
    <section aria-labelledby="mms-validation-title">
      <h2 id="mms-validation-title">Resumo da validação</h2>
      <dl className="mms-validation-grid">
        {metrics.map(([label, value]) => (
          <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
        ))}
      </dl>
      <p className={`mms-eligibility mms-eligibility--${preview.podeConfirmar ? "ok" : "blocked"}`}>
        {preview.podeConfirmar ? "✓ Pronta para confirmação" : "⚠ Confirmação bloqueada"}
      </p>
    </section>
  );
}
