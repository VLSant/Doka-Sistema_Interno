/**
 * Desktop sidebar: Doka logo, profile-adapted menu (derived from
 * `menu-config.ts`), active-state highlighting, hidden/disabled semantics,
 * and keyboard-accessible navigation.
 *
 * Per `route-navigation-contract.md` "Menu Contract": `disabled` items are
 * rendered (not removed from the DOM) with a clear "Ainda nao disponivel"
 * label and no link, and remain keyboard/screen-reader understandable
 * (`aria-disabled`, no `tabIndex`/no `href`, label still readable).
 * `hidden` items (profile not allowed) are excluded entirely by
 * `buildMenuForProfile`, before this component ever renders them.
 */
import { NavLink } from "react-router-dom";
import { Icon, type IconName } from "../ui/Icon";
import { buildMenuForProfile } from "../../modules/navigation/menu-config";
import type { PerfilUsuario } from "../../modules/access/types";
import "./Sidebar.css";

export interface SidebarProps {
  perfil: PerfilUsuario;
}

export function Sidebar({ perfil }: SidebarProps) {
  const items = buildMenuForProfile(perfil);

  return (
    <aside className="doka-sidebar" aria-label="Navegação principal">
      <div className="doka-sidebar__brand">
        <img className="doka-sidebar__logo" src="/design-system/logos/doka-logo-full.png" alt="Doka" />
      </div>
      <nav className="doka-sidebar__nav">
        <ul className="doka-sidebar__list">
          {items.map((item) => (
            <li key={item.id} className="doka-sidebar__item">
              {item.disabled ? (
                <span
                  className="doka-sidebar__link doka-sidebar__link--disabled"
                  aria-disabled="true"
                  title={item.unavailableLabel}
                >
                  <Icon name={item.icon as IconName} size={20} />
                  <span className="doka-sidebar__label">{item.label}</span>
                  <span className="doka-sidebar__unavailable">{item.unavailableLabel}</span>
                </span>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      "doka-sidebar__link",
                      isActive ? "doka-sidebar__link--active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")
                  }
                >
                  <Icon name={item.icon as IconName} size={20} />
                  <span className="doka-sidebar__label">{item.label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
