/**
 * Branded session-loading destination, shown while Auth/context resolve
 * (`inicializando`, `autenticando`, `resolvendo_contexto`). Never renders
 * protected content.
 */
import { LoadingState } from "../../../components/feedback/LoadingState";

export function SessionLoadingPage() {
  return <LoadingState message="Verificando sessao..." />;
}
