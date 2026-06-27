/**
 * Accessible e-mail/password login form.
 *
 * Clears the password field after any submission error and never reveals
 * whether the e-mail or password was the cause of failure
 * (`auth-session-contract.md` Login).
 */
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => Promise<{ ok: boolean; message?: string }>;
  submitting?: boolean;
}

export function LoginForm({ onSubmit, submitting = false }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const busy = submitting || isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await onSubmit({ email: email.trim(), password });
      if (!result.ok) {
        setPassword("");
        setError(result.message ?? "Nao foi possivel entrar. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="doka-login-form" onSubmit={handleSubmit} noValidate>
      <Input
        label="E-mail"
        type="email"
        name="email"
        autoComplete="username"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
        disabled={busy}
      />
      <Input
        label="Senha"
        type="password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        disabled={busy}
        error={error ?? undefined}
      />
      <Button type="submit" fullWidth loading={busy} disabled={busy}>
        Entrar
      </Button>
    </form>
  );
}
