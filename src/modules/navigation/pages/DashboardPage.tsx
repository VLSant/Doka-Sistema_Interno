/**
 * Neutral authenticated Dashboard destination.
 *
 * Per `data-model.md`/`route-navigation-contract.md`, this route is
 * `available` for this feature but must not simulate KPI or module data:
 * it only confirms that the authenticated/authorized shell renders.
 */
import { useAuth } from "../../auth/AuthProvider";

export function DashboardPage() {
  const { state } = useAuth();
  const nome = state.name === "autorizado" ? state.context.nome : "";

  return (
    <div className="doka-dashboard-page">
      <h1>Dashboard</h1>
      <p>Bem-vindo(a){nome ? `, ${nome}` : ""}.</p>
    </div>
  );
}
