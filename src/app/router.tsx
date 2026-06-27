/**
 * Data Router tree.
 *
 * Establishes public/protected branches with pending/error boundaries.
 * Protected content (`ProtectedRoute`) only ever renders its children when
 * the route guard's outcome is exactly `autorizado` (`protected-loader.ts`,
 * `route-guard.ts`); every other outcome redirects to a safe public/neutral
 * destination, shows a neutral unavailable state, or shows a loading state,
 * so no protected UI/module data can flash before authorization exists.
 *
 * Every `/app/*` destination from `ROUTE_DEFINITIONS` is registered here and
 * passes through the same `ProtectedRoute` gate, including an optional
 * `posto_id` query parameter validated by the route guard
 * (`route-navigation-contract.md` Evaluation Order).
 */
import type { ReactNode } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useNavigation,
  useRouteError,
  useSearchParams,
} from "react-router-dom";
import { LoadingState } from "../components/feedback/LoadingState";
import { FeedbackState } from "../components/feedback/FeedbackState";
import { AuthProvider, useAuth } from "../modules/auth/AuthProvider";
import { decideProtectedRoute } from "../modules/auth/protected-loader";
import { LoginPage } from "../modules/auth/pages/LoginPage";
import { RecoverPasswordPage } from "../modules/auth/pages/RecoverPasswordPage";
import { ResetPasswordPage } from "../modules/auth/pages/ResetPasswordPage";
import { SessionExpiredPage } from "../modules/auth/pages/SessionExpiredPage";
import { TemporaryFailurePage } from "../modules/auth/pages/TemporaryFailurePage";
import { AccessDeniedPage } from "../modules/access/AccessDeniedPage";
import { OperationalConfigurationPage } from "../modules/access/OperationalConfigurationPage";
import { DashboardPage } from "../modules/navigation/pages/DashboardPage";
import { ModuleUnavailablePage } from "../modules/navigation/pages/ModuleUnavailablePage";
import { NotFoundPage } from "../modules/navigation/pages/NotFoundPage";
import { AppShell } from "../components/layout/AppShell";
import { ROUTE_DEFINITIONS, type RouteId } from "./routes";

function RootLayout() {
  const navigation = useNavigation();

  if (navigation.state === "loading") {
    return <LoadingState message="Carregando..." />;
  }

  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

function RootErrorBoundary() {
  const error = useRouteError();
  const message = error instanceof Error ? error.message : "Erro inesperado.";

  return (
    <FeedbackState
      tone="error"
      title="Algo deu errado"
      description={`Nao foi possivel carregar esta pagina. ${message}`}
    />
  );
}

/**
 * Gate for every `/app/*` route. Revalidates the full route guard (Auth ->
 * context -> profile -> posto -> availability) on every render and renders
 * children only when the outcome is exactly `autorizado`; otherwise shows a
 * loading state, a neutral unavailable state, or redirects to a safe
 * destination, never the protected children.
 */
function ProtectedRoute({ routeId, children }: { routeId: RouteId; children: ReactNode }) {
  const { state } = useAuth();
  const [searchParams] = useSearchParams();
  const route = ROUTE_DEFINITIONS.find((definition) => definition.id === routeId) ?? null;
  const requestedPostoId = searchParams.get("posto_id");

  const decision = decideProtectedRoute({ authState: state, route, requestedPostoId });

  if (decision.kind === "loading") {
    return <LoadingState message="Verificando sessao..." />;
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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <RootErrorBoundary />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        // Public: accepts any e-mail and always returns the same neutral
        // confirmation (`auth-session-contract.md` Password Recovery
        // Request), so no Auth/context check gates this route.
        path: "recuperar-senha",
        element: <RecoverPasswordPage />,
      },
      {
        // Guarded by `recoveryState` inside `ResetPasswordPage` itself
        // (read from `AuthProvider`, derived only from a `PASSWORD_RECOVERY`
        // Auth event): an invalid/expired/reused link renders a safe failure
        // with a "Solicitar novo link" exit instead of the form
        // (`auth-session-contract.md` Password Recovery Completion).
        path: "redefinir-senha",
        element: <ResetPasswordPage />,
      },
      {
        path: "sessao-expirada",
        element: <SessionExpiredPage />,
      },
      {
        path: "falha-temporaria",
        element: <TemporaryFailurePage />,
      },
      {
        // Reached only through `ProtectedRoute`'s `acesso_negado` redirect;
        // never exposes resource/permission detail (`AccessDeniedPage.tsx`).
        path: "acesso-negado",
        element: <AccessDeniedPage />,
      },
      {
        // Reached only through `ProtectedRoute`'s `contexto_invalido`
        // redirect; groups every sensitive blocked reason into one neutral
        // message (`OperationalConfigurationPage.tsx`).
        path: "configuracao-operacional",
        element: <OperationalConfigurationPage />,
      },
      {
        path: "app",
        element: <AppShell />,
        children: ROUTE_DEFINITIONS.map((route) => ({
          path: route.path.replace(/^\/app\//, ""),
          element: (
            <ProtectedRoute routeId={route.id}>
              {route.id === "dashboard" ? (
                <DashboardPage />
              ) : (
                <ModuleUnavailablePage moduleLabel={route.label} />
              )}
            </ProtectedRoute>
          ),
        })),
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
