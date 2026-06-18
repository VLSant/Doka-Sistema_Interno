# Operations Dashboard — UI Kit

The internal **logistics control center** for Doka operators (the surface implied by the
*Operações Logísticas CMNL* semester report). It composes the Doka component primitives —
no primitive is re-implemented here.

## Files
- `index.html` — interactive shell. Nav between Dashboard ↔ Shipments; click any row to open the detail drawer.
- `Shell.jsx` — `Sidebar` + `Topbar` (window.DokaShell).
- `DashboardView.jsx` — KPI grid (StatCard), volume chart (inline SVG), status breakdown, recent shipments.
- `ShipmentsView.jsx` — Tabs + filter row + dense shipments table.
- `ShipmentDetail.jsx` — slide-over with ProgressTracker, driver, map placeholder, actions.
- `data.js` — mock shipments + volume (`window.DOKA_DATA`).

## Primitives used
Button, IconButton, Select, Checkbox, Card, StatCard, Badge, Tag, Avatar, Tabs, StatusPill, ProgressTracker.

## Icons
`assets/icons/icons.jsx` (Lucide subset) → `<Icon name="truck" />`.

## Notes / liberties
No real product code or Figma was provided, so screens are a faithful, brand-true
*representation* of a logistics ops console grounded in the report's domain — not a pixel
copy of an existing Doka screen. Charts/maps are placeholders; wire to real data sources.
