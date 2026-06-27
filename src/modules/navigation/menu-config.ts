/**
 * Menu derivation.
 *
 * Per `route-navigation-contract.md` "Menu Contract", the menu is generated
 * from the same typed route definitions used by the router
 * (`src/app/routes.ts`) — never a separate hardcoded list — combined with
 * the current profile. This module performs no IO/authorization decision:
 * it only derives presentation metadata. Real authorization stays sovereign
 * in `route-guard.ts`/RLS; a hidden or disabled menu entry is never treated
 * as proof of denial, nor does a visible entry imply data access
 * (`operational-access-contract.md` Security Invariants, "Never infer data
 * access from a visible menu item.").
 */
import { ROUTE_DEFINITIONS, isProfileAllowedForRoute, type RouteId } from "../../app/routes";
import type { PerfilUsuario } from "../access/types";

export interface MenuItem {
  id: RouteId;
  path: string;
  label: string;
  icon: string;
  navigationOrder: number;
  /** True when the item is rendered but not navigable (placeholder/disabled). */
  disabled: boolean;
  /** Present only when `disabled`; the clear "Ainda nao disponivel" label. */
  unavailableLabel?: string;
}

/**
 * Derives the menu for a given profile from `ROUTE_DEFINITIONS`. Routes
 * whose `profiles` do not include the current profile are entirely
 * excluded (`hidden`, per the Menu Contract: "not rendered"). Every other
 * route is included, ordered by `navigationOrder`; `placeholder`/`disabled`
 * routes are marked `disabled` (rendered, no link, clear unavailable
 * label); `available` routes are navigable.
 */
export function buildMenuForProfile(perfil: PerfilUsuario): MenuItem[] {
  return ROUTE_DEFINITIONS.filter((route) => isProfileAllowedForRoute(route, perfil))
    .map((route) => {
      const disabled = route.availability !== "available";
      return {
        id: route.id,
        path: route.path,
        label: route.label,
        icon: route.icon,
        navigationOrder: route.navigationOrder,
        disabled,
        ...(disabled ? { unavailableLabel: "Ainda não disponível" } : {}),
      };
    })
    .sort((a, b) => a.navigationOrder - b.navigationOrder);
}
