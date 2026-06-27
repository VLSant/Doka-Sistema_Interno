/**
 * Accessible new-password/confirmation form.
 *
 * Requires the two fields to match before submitting and clears both on a
 * submission error, mirroring `LoginForm.tsx`'s clearing pattern. Error
 * messages come from the recovery service's safe mapping
 * (`recovery-service.ts`), never a raw Supabase error string.
 */
import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";

export interface ResetPasswordFormProps {
  onSubmit: (newPassword: string) => Promise<{ ok: boolean; message?: string }>;
  submitting?: boolean;
}

const MISMATCH_MESSAGE = "As senhas informadas nao coincidem.";

export function ResetPasswordForm({ onSubmit, submitting = false }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const busy = submitting || isSubmitting;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setPassword("");
      setConfirmPassword("");
      setError(MISMATCH_MESSAGE);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit(password);
      if (!result.ok) {
        setPassword("");
        setConfirmPassword("");
        setError(result.message ?? "Nao foi possivel definir a nova senha. Tente novamente.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="doka-reset-password-form" onSubmit={handleSubmit} noValidate>
      <Input
        label="Nova senha"
        type="password"
        name="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        disabled={busy}
      />
      <Input
        label="Confirmar nova senha"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        required
        disabled={busy}
        error={error ?? undefined}
      />
      <Button type="submit" fullWidth loading={busy} disabled={busy}>
        Salvar nova senha
      </Button>
    </form>
  );
}
