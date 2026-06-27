/**
 * Branded temporary-failure destination shown when Auth/context cannot be
 * confirmed. Offers retry and a safe logout/login exit
 * (`auth-session-contract.md` Temporary Failure).
 */
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { FeedbackState } from "../../../components/feedback/FeedbackState";
import { useAuth } from "../AuthProvider";

export function TemporaryFailurePage() {
  const { revalidate, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <FeedbackState
      tone="error"
      title="Nao foi possivel confirmar sua sessao"
      description="Houve uma falha temporaria ao validar seu acesso. Tente novamente."
      actions={
        <>
          <Button onClick={() => revalidate()}>Tentar novamente</Button>
          <Button variant="outline" onClick={handleLogout}>
            Sair
          </Button>
        </>
      }
    />
  );
}
