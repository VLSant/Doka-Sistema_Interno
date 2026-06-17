---
name: doka-design
description: Use this skill to generate well-branded interfaces and assets for Doka (a Brazilian last-mile **delivery + furniture-assembly** brand — coordinating drivers and assemblers; orders, routes, hubs, tracking), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and
create static HTML files for the user to view. If working on production code, you can copy
assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build
or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_
production code, depending on the need.

## Quick map
- `styles.css` — single entry; `@import` it to get every token + font (CSS custom properties).
- `tokens/` — colors, typography, spacing, elevation, motion. Reference the semantic aliases
  (`--brand-primary`, `--surface-card`, `--status-transit`…), not raw ramps.
- `components/` — React primitives (Button, StatCard, StatusPill, ProgressTracker, Tabs…).
  Exported on `window.DokaDesignSystem_7dbee8`; props in each `.d.ts`, usage in each `.prompt.md`.
- `ui_kits/` — full screens (operations dashboard, tracking portal) to copy and adapt.
- `templates/report-deck/` — branded report/deck starting point.
- `assets/logos/` — logo lockups (`doka-logo-full` for light bg) + app mark; `assets/icons/icons.jsx` — Lucide `<Icon>` set; `assets/fonts/poppins/` — the Poppins font files.

## Brand in one breath
Friendly, dependable brand for **delivery + furniture assembly**. **Orange `#F09018`** leads
(CTAs, focus, energy); **purple `#602860`** grounds (covers, headers, depth). Everything
**rounded**; soft purple-tinted shadows; warm neutrals. **One typeface — Poppins** (300–900),
self-hosted; hierarchy by weight + size only; tabular figures for codes/KPIs. Line icons only
(Lucide). No emoji. Copy is warm, plain, outcome-focused, **PT-BR first** (entrega, montagem,
montador, ordem de serviço).
