/**
 * Branded public login page.
 *
 * Redirects already-authorized users to the Dashboard instead of rendering
 * the form again (`auth-session-contract.md` Public Routes: "/login ...
 * autorizado redireciona").
 */
import { Link, Navigate } from "react-router-dom";
import { Card } from "../../../components/ui/Card";
import { useAuth } from "../AuthProvider";
import { LoginForm, type LoginFormValues } from "../components/LoginForm";

export function LoginPage() {
  const { state, signIn } = useAuth();

  if (state.name === "autorizado") {
    return <Navigate to="/app/dashboard" replace />;
  }

  async function handleSubmit(values: LoginFormValues) {
    return signIn(values);
  }

  return (
    <div className="doka-login-page">
      <Card className="doka-login-page__card" padding="lg">
        <img
          className="doka-login-page__logo"
          src="/design-system/logos/doka-logo-full.png"
          alt="Doka"
        />
        <h1 className="doka-login-page__title">Entrar</h1>
        <p className="doka-login-page__subtitle">Acesse com seu e-mail e senha cadastrados.</p>
        <LoginForm onSubmit={handleSubmit} submitting={state.name === "autenticando"} />
        <Link className="doka-login-page__recovery-link" to="/recuperar-senha">
          Esqueci minha senha
        </Link>
      </Card>
    </div>
  );
}
