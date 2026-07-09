<!-- # SCMS — Project Context for Claude Code

Read this file first, every session, before writing any code.

## What this project is
SCMS (Stock & Consumable Management System) for Canvas Workspace — internal tool
for CEMs to log consumable deliveries/consumption/transfers per building, and
for Admin to monitor stock health and spend. Full requirements are in
`docs/PRD.md` — read the relevant section before building each feature.

## Non-negotiable rules (apply to every feature you build)
1. **Ledger is append-only.** Never write UPDATE or DELETE logic against
   `ledger_entries`, in the app or in SQL. RLS already blocks it — don't work
   around it.
2. **Hard blocks, not soft warnings**, on: consumption/transfer quantity
   exceeding current stock at that location; negative stock; negative price.
   Enforce in the UI AND rely on DB constraints as the final guard.
3. **Mobile-first for all CEM screens.** Big buttons, numeric keypad for
   quantity/cost fields, max 2 taps + 1 confirm per action, one decision per
   screen. Admin screens can be desktop-first.
4. **No new settings/config fields.** Categories, units, priorities, and
   movement reasons are fixed enums from the schema — never make them
   user-editable in Phase 1.
5. **Products are CEM-owned.** Only the CEM role can create/edit products.
   Admin can only toggle `is_active` (deactivate).
6. **Delivery only happens at the warehouse floor.** Transfer and Consumption
   can happen at any floor (including warehouse).
7. **Brand color is `#6500D6`** (Tailwind: `canvas` / `canvas-500`). Logo is
   at `public/logo.png`. Use the existing `canvas` Tailwind palette — don't
   invent new brand colors.
8. **Reuse components.** One `Button`, one `Card`, one `Modal` — build these
   first if they don't exist yet, then reuse everywhere. Don't create
   one-off styled variants per screen.

## Build order (do NOT jump ahead — build and confirm one phase before the next)
1. Shared UI primitives: Button, Card, Modal, NumericKeypadInput, Toast/confirmation screen.
2. Auth: login screen + Supabase Auth session handling + role-based redirect (admin vs cem).
3. CEM: Building Selector → Location Selector → Today's Check-In checklist (read-only first).
4. CEM: Log Delivery flow (warehouse only).
5. CEM: Log Consumption/Update Stock flow (with hard-block on over-stock).
6. CEM: Log Transfer Stock flow (with hard-block on over-stock).
7. CEM: Add/Edit Product screens (with name dedup soft-check).
8. CEM: My Ledger (scrollable, filterable) + Alerts list + My Note (sticky note).
9. Admin: Overview Dashboard (stock health summary, alerts, spend).
10. Admin: Building Detail View + Manage Buildings & Floors.
11. Admin: Manage CEM Assignments + Create CEM Account (via Edge Function).
12. Admin: Product Catalog (read-only + deactivate).
13. Admin: Ledger History (3 tabs — Purchase/Transfer/Consume) with filters.
14. Admin: Analytics charts (Recharts).
15. Admin: Reports & Export (Purchase/Delivery only, PDF/Excel).
16. Supabase Edge Function: low-stock alert generation trigger on ledger insert.
17. Supabase Edge Function: CEM account creation (admin API, service role).

## Database
- Schema: `supabase/migrations/0001_init_schema.sql` — already written, do not
  redesign it. If a feature seems to need a schema change, stop and flag it
  instead of altering migrations silently.
- Seed data: `supabase/seed.sql` — for local testing only.
- RLS is already fully defined in the migration. Don't add client-side
  "permission checks" that duplicate it — trust RLS, just handle the error
  response gracefully in the UI.

## Tech stack (already scaffolded, don't swap libraries)
React + Vite + TypeScript + Tailwind CSS, TanStack Query, Zustand, React Hook
Form, Recharts, Supabase (`src/lib/supabaseClient.ts` already configured).

## Token-efficiency instructions for you (Claude Code)
- Work on ONE numbered build-order item at a time. Don't pre-build later
  phases "while you're at it."
- Don't re-read the entire PRD every prompt — re-read only the PRD section
  relevant to the current feature (section numbers are in `docs/PRD.md`'s
  table of contents-style headers).
- Prefer editing/extending existing files over creating parallel new ones.
- Keep components small and colocated; don't scaffold folders you don't need yet. -->





# SCMS — Project Context for Claude Code

Read this file first, every session, before writing any code.

## What this project is
SCMS (Stock & Consumable Management System) for Canvas Workspace — internal tool
for CEMs to log consumable deliveries/consumption/transfers per building, and
for Admin to monitor stock health and spend. Full requirements are in
`docs/PRD.md` — read the relevant section before building each feature.

## Non-negotiable rules (apply to every feature you build)
1. **Ledger is append-only.** Never write UPDATE or DELETE logic against
   `ledger_entries`, in the app or in SQL. RLS already blocks it — don't work
   around it.
2. **Hard blocks, not soft warnings**, on: consumption/transfer quantity
   exceeding current stock at that location; negative stock; negative price.
   Enforce in the UI AND rely on DB constraints as the final guard.
3. **Mobile-first for all CEM screens.** Big buttons, numeric keypad for
   quantity/cost fields, max 2 taps + 1 confirm per action, one decision per
   screen. Admin screens can be desktop-first.
4. **No new settings/config fields.** Categories, units, priorities, and
   movement reasons are fixed enums from the schema — never make them
   user-editable in Phase 1.
5. **Products are CEM-owned.** Only the CEM role can create/edit products.
   Admin can only toggle `is_active` (deactivate).
6. **Delivery only happens at the warehouse floor.** Transfer and Consumption
   can happen at any floor (including warehouse).
7. **Brand color is `#6500D6`** (Tailwind: `canvas` / `canvas-500`). Logo is
   at `public/logo.png`. Use the existing `canvas` Tailwind palette — don't
   invent new brand colors.
8. **Reuse components.** One `Button`, one `Card`, one `Modal` — build these
   first if they don't exist yet, then reuse everywhere. Don't create
   one-off styled variants per screen.

## Build order (do NOT jump ahead — build and confirm one phase before the next)
1. Shared UI primitives: Button, Card, Modal, NumericKeypadInput, Toast/confirmation screen.
2. Auth: login screen + Supabase Auth session handling + role-based redirect (admin vs cem).
3. CEM: Building Selector → Location Selector → Today's Check-In checklist (read-only first).
4. CEM: Log Delivery flow (warehouse only).
5. CEM: Log Consumption/Update Stock flow (with hard-block on over-stock).
6. CEM: Log Transfer Stock flow (with hard-block on over-stock).
7. CEM: Add/Edit Product screens (with name dedup soft-check).
8. CEM: My Ledger (scrollable, filterable) + Alerts list + My Note (sticky note).
9. Admin: Overview Dashboard (stock health summary, alerts, spend).
10. Admin: Building Detail View + Manage Buildings & Floors.
11. Admin: Manage CEM Assignments + Create CEM Account (via Edge Function).
12. Admin: Product Catalog (read-only + deactivate).
13. Admin: Ledger History (3 tabs — Purchase/Transfer/Consume) with filters.
14. Admin: Analytics charts (Recharts).
15. Admin: Reports & Export (Purchase/Delivery only, PDF/Excel).
16. Supabase Edge Function: low-stock alert generation trigger on ledger insert.
17. Supabase Edge Function: CEM account creation (admin API, service role).

## Database
- Schema: `supabase/migrations/0001_init_schema.sql` — already written, do not
  redesign it. If a feature seems to need a schema change, stop and flag it
  instead of altering migrations silently.
- Seed data: `supabase/seed.sql` — for local testing only.
- RLS is already fully defined in the migration. Don't add client-side
  "permission checks" that duplicate it — trust RLS, just handle the error
  response gracefully in the UI.

## Tech stack (already scaffolded, don't swap libraries)
React + Vite + TypeScript + Tailwind CSS, TanStack Query, Zustand, React Hook
Form, Recharts, Supabase (`src/lib/supabaseClient.ts` already configured).

## Standing rules to prevent rework (added after a real bug — read carefully)
These exist because skipping them already caused one bug (dark mode applied
to the shell only, broke CEM which shares the same global theme state with
no matching styles). Apply them to every feature from now on:

1. **Every visual state (dark mode, hover, disabled, error, loading) is
   defined on the shared primitive (Button/Card/Modal/Input/etc.) at the
   time the primitive is built — never patched onto individual pages later.**
   A component owns both halves of its own contrast pair (background AND
   text together); never rely on inherited/cascaded color from a parent.
2. **Shared global state (theme, auth session, locale) must render correctly
   for every role, even roles with no UI control for it.** CEM has no dark
   mode toggle but shares the same `<html>` class as Admin — it must still
   look correct in either state. "No toggle" is not "immune to the setting."
3. **Any prompt that changes something global (theme, layout shell, routing,
   shared primitives) must sweep ALL existing screens in the same pass**, not
   just the screens named in the prompt. State this explicitly as done.
4. **State a definition of done per prompt.** "Dark mode is done" means every
   existing screen passes a visual check — not that the toggle exists and
   one page responds to it.
5. **After any UI-affecting prompt, screenshot-verify both Admin and CEM**
   before moving to the next build-order item, even if the prompt only
   targeted one role.
- Work on ONE numbered build-order item at a time. Don't pre-build later
  phases "while you're at it."
- Don't re-read the entire PRD every prompt — re-read only the PRD section
  relevant to the current feature (section numbers are in `docs/PRD.md`'s
  table of contents-style headers).
- Prefer editing/extending existing files over creating parallel new ones.
- Keep components small and colocated; don't scaffold folders you don't need yet.