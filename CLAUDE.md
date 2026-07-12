# SCMS — Project Context for Claude Code

Read this file first, every session, before writing any code.

## What this project is
SCMS (Stock & Consumable Management System) for Canvas Workspace — internal
tool for CEMs to log consumable deliveries/consumption/transfers per
building, and for Admin to monitor stock health and spend. Full requirements
are in `docs/PRD.md` — read the relevant section before building each
feature. Note: the Global Products section below supersedes parts of the
PRD's original per-building product model — where they conflict, this file
wins.

## Non-negotiable rules (apply to every feature you build)
1. **Ledger is append-only.** Never write UPDATE or DELETE logic against
   `ledger_entries`, in the app or in SQL — not even for data merges or
   corrections. RLS already blocks it — don't work around it. See "Global
   Products" below for how duplicate merges handle this without an
   exception.
2. **Hard blocks, not soft warnings**, on: consumption/transfer quantity
   exceeding current stock at that location; negative stock; negative price.
   Enforce in the UI AND rely on DB constraints as the final guard.
3. **Mobile-first for all CEM screens.** Big buttons, numeric keypad for
   quantity/cost fields, max 2 taps + 1 confirm per action, one decision per
   screen. Admin screens can be desktop-first.
4. **No new settings/config fields.** Categories, units, priorities, and
   movement reasons are fixed enums from the schema — never make them
   user-editable in Phase 1.
5. **Product ownership — see "Global Products" section below for the
   current, authoritative rules.** (This replaced an earlier per-building
   ownership model — don't follow anything you've seen referencing "CEM
   owns their building's product" as a design assumption anymore.)
6. **Delivery only happens at the warehouse floor.** Transfer and Consumption
   can happen at any floor (including warehouse).
7. **Brand color is `#6500D6`** (Tailwind: `canvas` / `canvas-500`). Full
   logo lockup is at `public/logo.png`; compact icon-only mark (for
   favicons and the mobile drawer) is at `public/favicon.png`. Use the
   existing `canvas` Tailwind palette — don't invent new brand colors.
8. **Reuse components.** One `Button`, one `Card`, one `Modal`, one
   `TopBar` — build these once, reuse everywhere. Don't create one-off
   styled variants per screen.

## Architectural decision: Global Products (supersedes original PRD Section 4)
As of migration `0008_global_products.sql`, products are GLOBAL, not
per-building. This is the current, authoritative model:

- **Global fields** (one value, shared across every building): name, model,
  category, unit, priority, price per unit, vendor. Editable by any CEM who
  has at least one building assignment (not gated to "their" product or
  "the product's creator") — NOT editable by Admin at all.
- **Per-building fields** (live in the `building_products` link table):
  `is_active` (that building's own show/hide), `low_stock_threshold`.
- **Admin's role on products is a global kill switch only** — deactivate/
  reactivate everywhere, via the `set_product_active()` RPC, never a direct
  field edit. If a screen lets Admin edit name/price/vendor/etc., that's
  wrong — fix it, don't extend it.
- **A CEM with zero building assignments cannot see or touch the product
  list at all.** Enforced by `is_assigned_cem()` in RLS, not just a UI
  hide — don't build a product screen reachable without an assignment.
- **Duplicate products are merged via `merged_into_product_id`, never by
  rewriting `ledger_entries`.** If you ever find yourself writing an UPDATE
  against `ledger_entries.product_id` for any reason, stop — that violates
  rule 1. Merged rows stay in `products` forever, excluded from every live
  view via `merged_into_product_id is null`, but old ledger rows keep
  pointing at them unchanged.
- **Dedup is enforced on name + model together**, not name alone — see the
  partial unique index on `products` in migration 0008.
- **Product creation auto-links to EVERY building immediately** (as of
  migration 0011) — not just the creating CEM's building. A new product is
  visible and stocked (at 0) everywhere the moment it's created. Only the
  creating CEM's building gets the threshold they entered; every other
  building starts with threshold null until that building's own CEM sets
  it. When Admin creates a new building, `link_all_products_to_building()`
  must be called right after, so it retroactively inherits every existing
  active product too — don't let a new building start with an empty catalog.
- **The search-as-you-type reuse picker still exists but rarely offers a
  "link" action now** — since everything's already linked everywhere on
  creation, matches will almost always show "already linked." Keep it
  anyway: it's still the mechanism that surfaces near-duplicate names/models
  before a CEM creates a true duplicate.
- **Product creation is now a single path in practice:** `create_product`
  auto-links to every building, so the manual "find-and-attach"
  (`link_product_to_building`) path is rarely exercised — it remains as a
  safety net (e.g. a building created before migration 0011 existed), not
  the primary flow. Don't remove it, but don't design new UI assuming it's
  commonly used either.
- Full migration + sequenced build prompts for this change:
  `docs/GLOBAL_PRODUCTS_PROMPTS.md`. Follow that sequence in order — don't
  jump ahead to later prompts in that file before earlier ones are verified.

## Build order (do NOT jump ahead — build and confirm one phase before the next)
1. Shared UI primitives: Button, Card, Modal, NumericKeypadInput, Toast/confirmation screen.
2. Auth: login screen + Supabase Auth session handling + role-based redirect (admin vs cem).
3. CEM: Building Selector → Location Selector → Today's Check-In checklist (read-only first).
4. CEM: Log Delivery flow (warehouse only).
5. CEM: Log Consumption/Update Stock flow (with hard-block on over-stock).
6. CEM: Log Transfer Stock flow (with hard-block on over-stock).
7. CEM: Add/Edit Product screens (with name+model dedup, per Global Products).
8. CEM: My Ledger (scrollable, filterable) + Alerts list + My Note (sticky note).
9. Admin: Overview Dashboard (stock health summary, alerts, spend).
10. Admin: Building Detail View + Manage Buildings & Floors.
11. Admin: Manage CEM Assignments + Create CEM Account (via Edge Function).
12. Admin: Product Catalog (read-only + deactivate, per Global Products).
13. Admin: Ledger History (3 tabs — Purchase/Transfer/Consume) with filters.
14. Admin: Analytics charts (Recharts).
15. Admin: Reports & Export (Purchase/Delivery only, PDF/Excel).
16. Supabase Edge Function: low-stock alert generation trigger on ledger insert.
17. Supabase Edge Function: CEM account creation (admin API, service role).
18. Global Products migration — see `docs/GLOBAL_PRODUCTS_PROMPTS.md` (retrofit
    across steps 3, 4, 7, 9, 10, 12, 13, 15 above; run its own prompt sequence
    rather than treating this as one more numbered step).

## Database
- Schema: `supabase/migrations/` — already written, do not redesign it ad
  hoc. If a feature seems to need a schema change beyond what's already
  planned in `docs/GLOBAL_PRODUCTS_PROMPTS.md`, stop and flag it instead of
  altering migrations silently.
- Seed data: `supabase/seed.sql` — for local testing only.
- RLS is already fully defined in the migrations. Don't add client-side
  "permission checks" that duplicate it — trust RLS, just handle the error
  response gracefully in the UI.

## Tech stack (already scaffolded, don't swap libraries)
React + Vite + TypeScript + Tailwind CSS, TanStack Query, Zustand, React Hook
Form, Recharts, Supabase (`src/lib/supabaseClient.ts` already configured).

## Standing rules to prevent rework (added after real bugs — read carefully)
These exist because skipping them already caused real bugs (dark mode
applied to the shell only, broke CEM which shares the same global theme
state with no matching styles; nav bar drifted between Admin/CEM because
they weren't built from one shared component). Apply them to every feature:

1. **Every visual state (dark mode, hover, disabled, error, loading) is
   defined on the shared primitive (Button/Card/Modal/Input/TopBar/etc.) at
   the time the primitive is built — never patched onto individual pages
   later.** A component owns both halves of its own contrast pair
   (background AND text together); never rely on inherited/cascaded color
   from a parent.
2. **Shared global state (theme, auth session, locale) must render
   correctly for every role, even roles with no UI control for it.** CEM
   has no dark mode toggle but shares the same `<html>` class as Admin — it
   must still look correct in either state. "No toggle" is not "immune to
   the setting."
3. **Any prompt that changes something global (theme, layout shell,
   routing, shared primitives) must sweep ALL existing screens in the same
   pass**, not just the screens named in the prompt. State this explicitly
   as done in your summary.
4. **State a definition of done per prompt.** "Dark mode is done" means
   every existing screen passes a visual check — not that the toggle exists
   and one page responds to it.
5. **After any UI-affecting prompt, screenshot-verify both Admin and CEM**
   before moving to the next build-order item, even if the prompt only
   targeted one role.

## Shared shell rule
Admin and CEM top bars must be built from the SAME `TopBar` primitive/
pattern — same logo sizing logic, same right-side action group order (dark
toggle → name/role → Change Password → Sign Out). Never let one role's
shell get updated without checking the other still matches. If a
shell-affecting prompt only mentions one role, apply it to both and say so
explicitly.

## Mobile Navigation Pattern (<768px)
Both Admin and CEM use an off-canvas drawer on mobile, built as an
extension of the existing `TopBar` primitive — never a second, separate nav
component.

- Below 768px: `TopBar` shows a hamburger icon (left) + compact icon-only
  logo (`public/favicon.png`) instead of the full horizontal lockup.
- Hamburger opens a left-side drawer, ~260–280px wide, slides in ~250ms,
  closes on outside-click or on selecting any nav item.
- Drawer content = the SAME nav items each shell already defines via
  `TopBar`'s `navSlot`/`secondaryRow` props — a different rendering of
  those existing items, never a new item list authored separately per shell.
- Drawer structure: nav items on top (icon + label each, active item
  highlighted in canvas purple, min 48px touch target), divider, then user
  info + Change Password + Sign Out at the bottom.
- 768px and above: unchanged — existing desktop/tablet nav stays exactly as
  is, no drawer.
- This is UI-only. No route, permission, auth, data-fetching, or naming
  changes ride along with a nav-pattern change, ever.

## RPC overload rule (added after a real bug — create_floor)
Postgres treats a function with a different argument count/order as a
SEPARATE function, not a replacement — `create or replace function` only
overwrites a function with the exact same signature. If an RPC's argument
list ever changes across migrations, the OLD overload is silently left
behind and PostgREST may keep routing calls to it based on which arguments
the frontend happens to send. Whenever an RPC's signature changes in a new
migration, that same migration (or an immediate follow-up) MUST explicitly
`drop function if exists old_name(old, arg, types);` — never assume
`create or replace` alone removed the old version. Never fix this by
editing the old migration where the RPC was first defined — migrations are
an append-only historical record (same principle as the ledger); the fix
always goes in a new migration on top, never a retroactive edit.


CEM routes (`/cem/:buildingId/*`) have no route-level check that the
buildingId in the URL actually belongs to the logged-in CEM. RLS correctly
blocks all data access either way (proven via network capture — zero rows,
no leak), so this is a UX/architecture gap, not a security hole. A CEM
without access to a given building sees an empty, non-functional page shell
instead of a clear "not assigned" message. This is app-wide (every CEM
screen, not just products) — pre-existing, not introduced by the Global
Products work. Needs a dedicated route-guard prompt, scoped to the whole
CEM route tree at once, not a per-screen patch.


## UX Polish round (post-Global-Products) — locked decisions
- **CTA renames are text-only.** Change only what's displayed on screen —
  never rename RPC params, function names, variables, or internal logic to
  match. Add a one-line code comment next to every changed label noting the
  original text, so future developers aren't confused by a mismatch between
  a button's text and the RPC/handler name it calls (e.g.
  `{/* was "Delivery Arrived" */}`).
- **Priority is deactivated, not removed.** The `products.priority` column
  and its enum constraint stay in the schema (cheap to revive later), but:
  the picker is hidden from Add/Edit Product, every create/update call
  hardcodes `'Necessary'`, and the three dead-fetch sites found in the
  priority audit (CEM Product List, the reuse-picker match cards, the
  Check-In stock pipeline) stop selecting the column at all.
- **Numeric keypad → native mobile keyboard, fixed once, globally.** Fix
  `components/ui/NumericKeypadInput.tsx` internally (swap to
  `<input inputmode="decimal">`) while preserving its existing external
  props/interface, so every screen using it (Delivery, Consumption,
  Transfer, Add/Edit Product) is fixed automatically. Only touch individual
  call sites if the shared component genuinely can't absorb the change.
  This REVERSES the original PRD's "numeric keypad by default, never a
  generic text input" rule — that rule is superseded here.
- **Warehouse renamed to "Main Store" — display label only.** No schema
  change; `floor_type = 'warehouse'` stays as-is internally. Every UI
  string showing "Warehouse" to a user changes to "Main Store."
- **Building names must be unique** (case/whitespace-insensitive, same
  `name_normalized` pattern as products) — enforced via migration 0013.
  Creating a building with a name that already exists must fail cleanly
  with a clear error, not a silent duplicate.
- **CEM deactivation is non-destructive.** `profiles.is_active` (added in
  0013) is the only new state; `cem_building_assignments` rows are NEVER
  deleted on deactivate. `has_building_access()`/`is_assigned_cem()` both
  now also require `profiles.is_active` — this is the only place the logic
  lives, so no other RLS policy needs touching. Deactivating a CEM makes
  them hit the same "not assigned to any building" screen already built
  for zero-assignment CEMs — reuse that, don't build a second message.
  Only `set_cem_active()` (Admin-only RPC) may change this flag.
- **Overview Dashboard: collapse long lists, don't redesign yet.** Both the
  "All Buildings" list and "Active Alerts" list show at most 2–3 items by
  default with a "See more" expand — same pattern, applied to both
  sections independently. No other dashboard restructuring in this round;
  deeper customization (KPI cards, Recent Activity feed, etc.) is
  explicitly deferred, not in scope here.
- **PWA is the LAST item in this whole polish round**, not before. Manifest
  + service worker setup should happen once the app's screens/routes are
  stable, since the service worker's cache list depends on knowing what
  exists. Scope: installable + faster repeat loads + a clear offline-state
  message. NOT full offline data entry/write-queueing — that's a separate,
  larger feature, not part of this round.

## Token-efficiency instructions for you (Claude Code)
- Work on ONE numbered build-order item (or ONE prompt from
  `docs/GLOBAL_PRODUCTS_PROMPTS.md`) at a time. Don't pre-build later
  phases "while you're at it."
- Don't re-read the entire PRD every prompt — re-read only the PRD section
  relevant to the current feature.
- Prefer editing/extending existing files over creating parallel new ones.
- Keep components small and colocated; don't scaffold folders you don't
  need yet.











