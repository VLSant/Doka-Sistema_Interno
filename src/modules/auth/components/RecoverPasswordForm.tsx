/**
 * Accessible password-recovery request form.
 *
 * Always shows the same neutral confirmation regardless of whether the
 * e-mail is registered (`auth-session-contract.md` Password Recovery
 * Request: "Mostrar a mesma confirmacao neutra para e-mail existente ou
 * inexistente").
 */
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export interface RecoverPasswordFormProps {
  onSubmit: (email: string) => Promise<{ ok: true }>;
  submitting?: boolean;
}

export function RecoverPasswordForm({ onSubmit, submitting = false }: RecoverPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const busy = submitting || isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(email.trim());
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <p role="status" className="doka-recover-password-form__confirmation">
        Se o e-mail informado estiver cadastrado, enviaremos um link de recuperacao de senha.
        Verifique sua caixa de entrada.
      </p>
    );
  }

  return (
    <form className="doka-recover-password-form" onSubmit={handleSubmit} noValidate>
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
      <Button type="submit" fullWidth loading={busy} disabled={busy}>
        Enviar link de recuperacao
      </Button>
    </form>
  );
}
