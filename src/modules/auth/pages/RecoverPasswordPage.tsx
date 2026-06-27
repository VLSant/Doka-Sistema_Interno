/**
 * Branded public password-recovery request page
 * (`auth-session-contract.md` Public Routes: "/recuperar-senha ... Publica").
 */
import { Link } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { getRecoveryService } from "../recovery-service";
import { RecoverPasswordForm } from "../components/RecoverPasswordForm";

export function RecoverPasswordPage() {
  async function handleSubmit(email: string) {
    return getRecoveryService().requestPasswordRecovery(email);
  }

  return (
    <div className="doka-login-page">
      <Card className="doka-login-page__card" padding="lg">
        <img
          className="doka-login-page__logo"
          src="/design-system/logos/doka-logo-full.png"
          alt="Doka"
        />
        <h1 className="doka-login-page__title">Recuperar senha</h1>
        <p className="doka-login-page__subtitle">
          Informe o e-mail cadastrado para receber um link de recuperacao de senha.
        </p>
        <RecoverPasswordForm onSubmit={handleSubmit} />
        <p className="doka-login-page__subtitle">
          <Link to="/login">Voltar ao login</Link>
        </p>
      </Card>
    </div>
  );
}
