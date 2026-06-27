/**
 * Shared authenticated App Shell: composes `Sidebar` + `UserContextPanel`
 * around a route `Outlet`, with desktop responsive constraints
 * (`route-navigation-contract.md` "Desktop Validation").
 *
 * Reads identity/profile/postos only from the `autorizado` state. The Outlet
 * remains mounted while a route revalidation temporarily clears that state,
 * allowing ProtectedRoute to finish the check without a remount loop.
 */
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { UserContextPanel } from "./UserContextPanel";
import { useAuth } from "../../modules/auth/AuthProvider";
import "./AppShell.css";

export function AppShell() {
  const { state, signOut } = useAuth();
  const navigate = useNavigate();

  const context = state.name === "autorizado" ? state.context : null;

  async function handleLogout() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="doka-app-shell">
      {context ? <Sidebar key="sidebar" perfil={context.perfil} /> : null}
      <div key="content" className="doka-app-shell__content">
        {context ? (
          <header className="doka-app-shell__header">
            <UserContextPanel context={context} onLogout={handleLogout} />
          </header>
        ) : null}
        <main className="doka-app-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
