/**
 * Authenticated user/profile/posto summary plus logout control.
 *
 * Per `route-navigation-contract.md` "App Shell" ("Current user name",
 * "Profile display name", "Accessible postos or 'Escopo global'", "Logout
 * action") and `operational-access-contract.md` ("Direcao/Administracao
 * pode exibir 'Escopo global' sem carregar todos os postos no App Shell.").
 */
import { Avatar } from "../ui/Avatar";
import { IconButton } from "../ui/IconButton";
import { Icon } from "../ui/Icon";
import type { OperationalAccessContext, PerfilUsuario } from "../../modules/access/types";
import "./UserContextPanel.css";

const PROFILE_LABELS: Record<PerfilUsuario, string> = {
  operador: "Operador",
  supervisao: "Supervisão",
  direcao_admin: "Direção/Administração",
};

export interface UserContextPanelProps {
  context: OperationalAccessContext;
  onLogout: () => void;
}

export function UserContextPanel({ context, onLogout }: UserContextPanelProps) {
  const scopeLabel = context.escopoGlobal
    ? "Escopo global"
    : context.postos.map((posto) => posto.nome).join(", ");

  return (
    <div className="doka-user-context-panel">
      <Avatar name={context.nome} size="md" />
      <div className="doka-user-context-panel__info">
        <span className="doka-user-context-panel__name">{context.nome}</span>
        <span className="doka-user-context-panel__profile">{PROFILE_LABELS[context.perfil]}</span>
        <span className="doka-user-context-panel__scope">{scopeLabel}</span>
      </div>
      <IconButton aria-label="Sair" variant="ghost" onClick={onLogout} title="Sair">
        <Icon name="log-out" size={18} />
      </IconButton>
    </div>
  );
}
