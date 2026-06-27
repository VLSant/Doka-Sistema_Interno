/**
 * Branded session-expired destination with a safe return-to-login action
 * (`auth-session-contract.md` Session Expiration: "Mostrar estado
 * `sessao_expirada`. Permitir voltar ao login.").
 */
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { FeedbackState } from "../../../components/feedback/FeedbackState";

export function SessionExpiredPage() {
  const navigate = useNavigate();

  return (
    <FeedbackState
      tone="neutral"
      title="Sua sessao expirou"
      description="Por seguranca, sua sessao foi encerrada. Entre novamente para continuar."
      actions={
        <Button onClick={() => navigate("/login", { replace: true })}>Voltar ao login</Button>
      }
    />
  );
}
