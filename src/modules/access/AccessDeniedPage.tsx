/**
 * Access-denied destination shown when an authenticated, contextually-valid
 * user reaches a route their profile/posto does not permit
 * (`route-navigation-contract.md` "Access denied"). Per
 * `operational-access-contract.md` Security Invariants, the message never
 * reveals resource data or the specific denied permission.
 */
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { FeedbackState } from "../../components/feedback/FeedbackState";

export function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <FeedbackState
      tone="neutral"
      title="Acesso negado"
      description="Voce nao tem acesso a esta area. Contate o administrador."
      actions={<Button onClick={() => navigate("/app/dashboard", { replace: true })}>Voltar ao Dashboard</Button>}
    />
  );
}
