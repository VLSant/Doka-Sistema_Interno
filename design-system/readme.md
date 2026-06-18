# Doka Design System

A brand & product design system for **Doka** — a Brazilian logistics company for **last-mile
delivery and furniture assembly**. Doka coordinates the labor of **delivery drivers
(motoristas entregadores)** and **furniture assemblers (montadores de móveis)** — so a
"job" is often *deliver + assemble* at the customer's address, not just a drop-off. The
artifacts provided were the official brand palette, the Doka logo/icon files, the **Poppins**
font family, and a semester operations report (*Relatório DOKA Semestral · Operações
Logísticas CMNL*, a PowerPoint export in Portuguese).

> **Sources given** (kept for reference; reader may not have access):
> - `uploads/Paleta Doka.pdf` — color palette. Official anchors confirmed from the logo: orange `#F09018`, purple `#602860`.
> - `uploads/Relatorio DOKA Semestral - 2023.1 - Operacoes Logisticas CMNL.pdf` — semester ops report (deck).
> - `uploads/logo_dokaicone.png` — **primary full-color lockup** (purple wordmark + orange mark) for light bg.
> - `uploads/Logo laranja .png`, `Logo roxa.png` — lockups with white wordmark (for dark bg).
> - `uploads/Flaticon laranja .png`, `ícone branco sem fundo.png` — app mark (orange / white).
> - `uploads/Poppins/` — the **Poppins** typeface (OFL), the brand's single font, self-hosted in `assets/fonts/`.
>
> No codebase or Figma was provided. The UI kits and slides are therefore **brand-true
> recreations** of plausible Doka surfaces grounded in the report's domain — not pixel
> copies of an existing screen.

---

## Brand at a glance

- **Name:** Doka · **Domain:** last-mile **delivery + furniture assembly**; coordinating
  drivers and assemblers, with order/route/hub management and customer tracking.
- **Mark:** a rounded-square "D" glyph. Orange tile on light, purple tile or white glyph on dark.
- **Personality:** friendly, confident, dependable. Rounded everything. Warm, energetic
  orange paired with a grounded purple. Operational rigor (data, order codes) softened by
  a human, reassuring voice.

---

## CONTENT FUNDAMENTALS

How Doka writes.

- **Voice:** plain, warm, reassuring — a competent operator who keeps promises. Confidence
  without hype. The hero line *"Entrega e montagem, sem dor de cabeça."* captures it: short,
  declarative, outcome-focused.
- **Language:** copy is **Brazilian Portuguese** first
  (*"Operações"*, *"Entregas"*, *"Montagens"*, *"Atraso médio"*, *"Montador a caminho"*).
  English is fine in internal ops tooling; keep customer-facing strings in PT-BR.
- **Person:** speak **to** the user — *"Onde está meu pedido?"*, *"Avise-me na entrega"*.
  Internal/ops tooling is neutral-declarative (*"1.284 ordens ativas em 6 hubs"*).
- **Casing:** Sentence case for headings and buttons. UPPERCASE only for small tracked
  eyebrows/labels (*"Operações"*, *"Indicadores · 1º semestre"*). Never ALL-CAPS sentences.
- **Numbers & codes:** prominent and tabular (Poppins `tnum`). Order codes read
  `DK-8847-2291-BR`; metrics lead with the number (`96%`, `14 min`, `184k`). Units de-emphasized.
- **Domain words:** *entrega* (delivery), *montagem* (assembly), *montador* (assembler),
  *motorista/entregador* (driver), *ordem de serviço / OS* (work order), *janela* (time window).
- **Tone of status:** factual and calm even for problems — *"Atrasado · +35 min"*,
  *"Endereço não encontrado"* — never alarmist.
- **Emoji:** not used. Iconography carries visual meaning instead.
- **Examples:**
  - CTA: *"Acompanhar pedido"*, *"Reatribuir"*, *"Concluir montagem"*, *"Avise-me na entrega"*.
  - Eyebrow: *"RASTREAMENTO EM TEMPO REAL"*, *"PRIORIDADES · PRÓXIMO SEMESTRE"*.
  - Empty/placeholder: *"Conecte uma fonte de dados para preencher esta visão."*

---

## VISUAL FOUNDATIONS

### Color
- **Orange `#F09018`** is the primary — CTAs, focus, active nav, "today"/peak emphasis,
  the energy of the brand. Hover deepens to `#D87F10`, press `#B0660A`. (Straight from the logo.)
- **Purple `#602860`** is the secondary/depth — dark cover backgrounds, header bands,
  secondary buttons, the avatar fallback. Deeper shade `#4F204E` for large dark fields.
- **Neutrals** are warm-leaning grays anchored on the brand's own `#E6E6E6` (light gray)
  and `#3B3B3B` (charcoal). Page background is a near-white `#FAF9FA`; cards are pure white.
- **Status palette** (ops-specific): delivered/done = green `#1E9E5A`, in-transit = blue
  `#2D7FF9`, out-for-delivery = orange, delayed = amber `#F0A024`, exception = red `#E0464B`,
  pending = gray. Always shown as soft-tinted pills with a leading dot.
- Two-color rule: a surface is mostly neutral with **one** brand color leading (orange OR
  purple), not both fighting. Covers go purple; CTAs and accents go orange.

### Type — Poppins only
- **One typeface: Poppins**, self-hosted (OFL) in `assets/fonts/poppins/`. The brand
  expresses hierarchy through **weight and size**, never a second family.
- **Display / headlines:** Poppins **ExtraBold 800** (or Bold 700), tight tracking (−0.02em)
  — hero lines, big KPI numbers.
- **Body / UI:** Poppins **Regular 400 → SemiBold 600** for paragraphs, labels, tables, forms.
- **Numerals & codes:** Poppins with **tabular figures** (`font-feature-settings: "tnum"`,
  token `--num-tabular`) for order codes, KPIs, timestamps.
- Minimum product text 13px; slide text ≥ 24px.

### Shape, depth & motion
- **Corners are generously rounded** — controls `12px`, cards `16px`, pills fully round —
  echoing the rounded-square mark. Nothing is sharp.
- **Shadows** are soft and **purple-tinted** (`rgba(48,19,48,…)`), never pure black; low
  spread, gentle. Primary CTAs gain an **orange glow** (`shadow-brand`) on hover.
- **Borders** are hairline `#E6E6E6`; inputs go orange on focus with a soft orange ring.
- **Cards:** white surface, 1px subtle border, soft shadow, 16px radius. Interactive cards
  lift 1px and deepen their shadow on hover.
- **Motion:** quick and confident (140–360ms). Standard ease `cubic-bezier(.2,0,0,1)`;
  entrances/toggles use a gentle spring `cubic-bezier(.34,1.56,.64,1)` (small overshoot).
  **Hover** = lift + deepen/darken; **press** = shrink to `0.97`. No infinite decorative loops.
- **Backgrounds:** mostly flat neutral surfaces. Brand expression comes from solid purple or
  orange blocks and one signature device — a soft **purple→orange gradient** used only for
  map placeholders and hero washes. Organic rounded "blob" shapes appear on cover slides.
- **Transparency/blur:** reserved for overlays — the detail drawer dims the page
  with a purple scrim + light backdrop blur. Used sparingly.

---

## ICONOGRAPHY

- **System:** [Lucide](https://lucide.dev) (ISC license) — chosen for its rounded joins and
  2px stroke on a 24px grid, which match the brand's rounded geometry. A curated subset is
  embedded in **`assets/icons/icons.jsx`** as path data and exposed as a React component:
  `<Icon name="truck" size={20} />` (`window.Icon`; names in `window.DokaIconNames`).
- **Style rules:** line icons only, 2px stroke, `currentColor` so they inherit text color;
  size 16–20px in UI, 24–32px for feature/empty states. Never filled, never multicolor.
- **Domain set:** truck, package, route, map, pin, warehouse, clock, weight, plus the usual
  UI verbs (search, filter, bell, settings…). Add more Lucide glyphs to `icons.jsx` as needed.
- **Logo/app mark** is **not** an icon — use the PNG lockups in `assets/logos/`.
- **Emoji / unicode glyphs:** not used as icons anywhere.

### Assets (`assets/`)
- `logos/doka-logo-full.png` — **primary** full-color lockup (purple wordmark + orange mark) for **light** bg.
- `logos/doka-logo-orange.png` — white wordmark + orange mark (for **dark** bg).
- `logos/doka-logo-purple.png` — white wordmark + purple mark (for **dark** bg).
- `logos/doka-icon-orange.png` / `-white.png` / `-purple.png` — app mark (rounded-square "D") variants.
- `fonts/poppins/` — the Poppins typeface (`.ttf`, OFL) + `OFL.txt` license.
- `icons/icons.jsx` — Lucide icon component.

> **Derived asset:** `doka-icon-purple.png` was recolored from the orange app mark. All
> other logos and the fonts are the originals supplied by the brand.

---

## FONTS — Poppins

The brand uses **one typeface: Poppins** (Open Font License). It is **self-hosted** — the
`.ttf` files live in `assets/fonts/poppins/` and are declared as `@font-face` rules in
`tokens/fonts.css` (weights 300–900 + italic). No external/Google-Fonts dependency.
Hierarchy comes from **weight and size only** — never introduce a second family. For order
codes, KPIs and tables, enable tabular figures via the `--num-tabular` token
(`font-feature-settings: "tnum" 1`).

---

## INDEX / manifest

**Foundations & entry**
- `styles.css` — the single entry point consumers link (`@import` manifest only).
- `tokens/` — `fonts.css` (self-hosted Poppins), `colors.css`, `typography.css`,
  `spacing.css`, `elevation.css`, `motion.css`, `base.css`.

**Components** (`components/`, namespace `window.DokaDesignSystem_7dbee8`)
- `forms/` — Button, IconButton, Input, Select, Checkbox, Switch
- `display/` — Card, StatCard, Avatar, Badge, Tag
- `feedback/` — StatusPill, ProgressTracker
- `navigation/` — Tabs
- Each has `<Name>.jsx` + `.d.ts` + `.prompt.md`, and one `@dsCard` showcase per folder.

**UI kits** (`ui_kits/`)
- `operations-dashboard/` — internal ops control center (KPIs, orders/shipments table, detail drawer).
- `tracking-portal/` — customer-facing delivery & assembly tracking page.

**Templates** (`templates/`)
- `report-deck/` — Doka-branded semester/report deck (cover · data · closing) as a Design Component.

**Specimen cards** (`guidelines/foundations/`) — colors, type, spacing, radius, elevation, brand.

**Slides** (`slides/`) — `01-title`, `02-section`, `03-data`, `04-content`, `05-quote`.

**Skill** — `SKILL.md` (Agent-Skill compatible).
