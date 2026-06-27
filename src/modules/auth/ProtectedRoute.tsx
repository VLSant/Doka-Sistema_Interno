import { useEffect, useRef, useState, type ReactNode } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { ROUTE_DEFINITIONS, type RouteId } from "../../app/routes";
import { LoadingState } from "../../components/feedback/LoadingState";
import { ModuleUnavailablePage } from "../navigation/pages/ModuleUnavailablePage";
import { NotFoundPage } from "../navigation/pages/NotFoundPage";
import { useAuth } from "./AuthProvider";
import { decideProtectedRoute } from "./protected-loader";

/**
 * Shared gate for every internal route.
 *
 * A location is never rendered with context validated for a previous
 * location. Each pathname/query change first confirms Auth and reloads the
 * operational profile/posto context under RLS.
 */
export function ProtectedRoute({ routeId, children }: { routeId: RouteId; children: ReactNode }) {
  const { state, revalidate } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const validationKey = `${routeId}:${location.pathname}${location.search}`;
  const [validatedKey, setValidatedKey] = useState<string | null>(null);
  const validationSequence = useRef(0);
  const route = ROUTE_DEFINITIONS.find((definition) => definition.id === routeId) ?? null;
  const requestedPostoId = searchParams.get("posto_id");

  useEffect(() => {
    const sequence = ++validationSequence.current;

    void revalidate().finally(() => {
      if (sequence === validationSequence.current) {
        setValidatedKey(validationKey);
      }
    });

    return () => {
      validationSequence.current += 1;
    };
  }, [revalidate, validationKey]);

  if (validatedKey !== validationKey) {
    return <LoadingState message="Verificando sessão..." />;
  }

  const decision = decideProtectedRoute({ authState: state, route, requestedPostoId });

  if (decision.kind === "loading") {
    return <LoadingState message="Verificando sessão..." />;
  }
  if (decision.kind === "redirect") {
    return <Navigate to={decision.to} replace />;
  }
  if (decision.kind === "modulo_indisponivel") {
    return <ModuleUnavailablePage moduleLabel={route?.label ?? "Módulo"} />;
  }
  if (decision.kind === "rota_nao_encontrada") {
    return <NotFoundPage />;
  }

  return <>{children}</>;
}
