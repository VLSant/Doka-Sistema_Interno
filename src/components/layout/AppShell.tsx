/**
 * Shared authenticated App Shell: composes `Sidebar` + `UserContextPanel`
 * around a route `Outlet`, with desktop responsive constraints
 * (`route-navigation-contract.md` "Desktop Validation").
 *
 * Reads the operational context from `AuthProvider`'s `autorizado` state
 * only; renders nothing of the shell otherwise (the surrounding
 * `ProtectedRoute` in `router.tsx` already guarantees this component is
 * only mounted once the route guard outcome is exactly `autorizado`, but
 * this component defends independently in case it is reused elsewhere).
 */
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { UserContextPanel } from "./UserContextPanel";
import { useAuth } from "../../modules/auth/AuthProvider";
import "./AppShell.css";

export function AppShell() {
  const { state, signOut } = useAuth();
  const navigate = useNavigate();

  if (state.name !== "autorizado") {
    return null;
  }

  const { context } = state;

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="doka-app-shell">
      <Sidebar perfil={context.perfil} />
      <div className="doka-app-shell__content">
        <header className="doka-app-shell__header">
          <UserContextPanel context={context} onLogout={handleLogout} />
        </header>
        <main className="doka-app-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
