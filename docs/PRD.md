# SCMS — Stock & Consumable Management System
### PRD v1.0 — Canvas Workspace (Phase 1 MVP)

---

## 1. Product Overview

SCMS is an internal tool for Canvas Workspace that tracks daily consumable inventory (coffee beans, milk, tissue paper, cleaning materials, and other everyday-use items) across every client building. It replaces memory, spreadsheets, and WhatsApp messages with one simple, shared system of record.

**Core idea:** Every morning, the Client Engagement Manager (CEM) assigned to a building does a two-minute check-in — logging what arrived (deliveries) and what's left (stock levels). Admin/Leadership gets real-time visibility into stock health and spend across all buildings, without chasing anyone for updates.

**Design mandate:** The primary users (CEMs) are not tech-savvy. Every screen must be usable by someone who has never used a business app before. If a workflow takes more than 3 taps, it's wrong.

---

## 2. Problem Statement

- CEMs currently track consumables manually — memory, notebooks, or ad-hoc WhatsApp messages to Admin.
- Stock runs out before anyone notices it needs reordering, causing client-facing shortages.
- Admin/Leadership has zero real-time visibility into building-level stock risk or company-wide consumable spend.
- There's no historical record — no way to answer "how much milk did Building X use last month?" without digging through chats.

**The requirement in one line:** No client should ever run out of a consumable, and leadership should be able to see stock and spend health instantly, without asking anyone.

---

## 3. Product Philosophy

| Principle | What it means in practice |
|---|---|
| Speed over completeness | The daily check-in must be completable in under 2 minutes, in 2–3 taps per item |
| Simplicity over configurability | No settings, no custom fields in Phase 1 — everything is pre-defined |
| Visibility over paperwork | Every entry is timestamped and traceable; no manual reconciliation ever needed |
| Building-first thinking | Inventory lives at the building level; floors/warehouse are locations within it |
| Mobile-first, not mobile-friendly | CEMs will do this standing in a pantry on their phone — design for that reality first, desktop second |

---

## 4. Users & Roles

Clients never log in. All requests and updates flow through the CEM.

### 4.1 CEM (Client Engagement Manager)
- Assigned to one or more buildings.
- Does the daily morning check-in: logs deliveries (what arrived) and current stock (what's left).
- Can log ad-hoc stock usage/consumption during the day (e.g., "used 2 tissue rolls for event").
- Can log stock transfers between warehouse and floors, or floor to floor.
- Can create new products when something new needs tracking — goes live immediately, no approval step.
- Is the **only** role that can edit product details (model, price, vendor, threshold) after creation.
- Has a private, single-block "sticky note" pad — not tied to any building, overwritable, visible only to that CEM.
- Receives low-stock alerts for their assigned buildings only.
- Can change their own password from within the app.

### 4.2 Admin / Operations Leadership
- Views all buildings, all CEMs, all data — read access everywhere.
- Manages buildings, floors (non-warehouse), and CEM-to-building assignments.
- **Creates CEM accounts** — provides name, company email (`user_id`, used as login), manually types a temporary password, and the CEM's personal Gmail (contact-only field, not used for login/recovery). This action creates both the `auth.users` login record and a linked `profiles` row with role `cem`. CEM can change this password from within their own app afterward.
- Can **deactivate** products (hides from that building's view) — cannot create or edit products.
- Views dashboards: stock health across all buildings, expense analytics, usage trends.
- Exports reports (PDF/Excel).

---

## 5. Core Workflow — The Daily Morning Check-In

This is the heart of the product. Everything else supports this loop.

**Step 1** — CEM opens the app (mobile, most likely) and lands on their assigned building's check-in screen. If they manage multiple buildings, they pick one from a simple large-button list.

**Step 2** — CEM selects a location from a dropdown: **Warehouse**, a specific **Floor**, or **All Floors** (floors and warehouse are both created/exist per building; warehouse is auto-created, floors are Admin-created).

- **Warehouse selected** → three big buttons: *Delivery Arrived*, *Transfer Stock*, *Update Stock*.
- **A specific Floor selected** → two big buttons: *Transfer Stock*, *Update Stock*.
- **All Floors selected** → read-only view showing all products across all locations in the building (no action buttons).

The checklist shows products grouped by category (Pantry, Cleaning, Stationery, etc.), each showing: product name + icon, current known stock level at the selected location, and color-coded status (green = healthy, yellow = low stock, grey = no threshold set). Products at 0 stock for a given floor are hidden from that floor's CEM view (the underlying record still exists at 0).

**Step 3a — Logging a delivery** (warehouse only): Tap "Delivery Arrived" → enter quantity received (numeric keypad, pre-filled unit) → enter price per unit (pre-filled with the last price used, shown as "Last time: ₹X/unit," editable) → total auto-calculates (quantity × price per unit) → Confirm. System updates warehouse stock and sets the product's new `current_price_per_unit`.

**Step 3b — Logging consumption / stock update**: Tap "Update Stock" → enter **quantity used** → system calculates new stock as `current stock − quantity used` → pick a reason from a preset list (Routine Use, Event, Emergency, Damaged, Maintenance) → Confirm. **Hard-blocked** if quantity used exceeds current stock at that location ("Only X left").

**Step 3c — Transfer Stock**: Tap "Transfer Stock" → enter quantity to transfer → select destination (floor↔floor, warehouse↔floor, floor↔warehouse) → Confirm. **Hard-blocked** if quantity exceeds current stock at the source location. Deducts from source, adds to destination. No price fields involved.

**Step 4** — Every action is instantly written to the ledger: permanent, non-editable, timestamped, tied to the CEM who logged it.

**Step 5** — If stock crosses the low-stock threshold, the dashboard flags it immediately — no separate action needed from the CEM.

This entire loop should take a trained CEM under 2 minutes for a building with ~15–20 tracked items.

---

## 6. Scope — Phase 1 MVP

### In Scope
- **6.1** Role-based login (Admin, CEM) via Supabase Auth (email + password). CEM accounts are created by Admin only (see Section 4.2); CEMs can change their own password afterward.
- **6.2** Building management (Admin) + Floor management (Admin-created). Exactly one warehouse per building, auto-created by the system when the building is created (not manually created by Admin).
- **6.3** Product catalog: CEM-created per building, with category, unit of measurement, priority tag, model, vendor name, price per unit, and an optional low-stock threshold. Fully editable by the creating CEM at any time.
- **6.4** Three-action stock workflow: Delivery (warehouse only), Transfer (any floor/warehouse combination), Consumption/Update (any location).
- **6.5** Mandatory quantity entry on delivery with auto-calculated total price (quantity × price per unit). Price is always per unit (Kg, Litre, Unit, Piece, Packet, Box, Sachet, Roll, Bag).
- **6.6** Inventory & Expense Ledger — bank-passbook style, append-only, fully auditable. Stock and price values can never go negative.
- **6.7** Dashboard alert: Low Stock only (Heavy/Unusual Usage deferred to Phase 3).
- **6.8** Admin analytics dashboard: stock health by building, spend by category/building/time, top-consumed items.
- **6.9** CEM dashboard: their building(s), floor/warehouse selector, private note pad, simplified view.
- **6.10** PDF/Excel export for Admin — **Purchase/Delivery history only** in Phase 1/2.
- **6.11** Purple Canvas Workspace branding throughout (logo, color system).

### Out of Scope (Phase 1)
- Client-facing access of any kind.
- Multi-step approval workflows.
- Vendor management as a managed entity (vendor is a free-text field only).
- Stock transfer between different *buildings* (only within a building, across its own floors/warehouse).
- AI-driven predictive reordering.
- Automated WhatsApp notifications (manual coordination continues for now).
- Heavy/Unusual Usage alerts (Phase 3).
- Price visibility on Transfer and Consumption ledger entries (Phase 3).
- Weighted-average price calculation (Phase 3) — Phase 1/2 uses current price only.

---

## 7. Data & Process Standards

Fixed, system-wide, not user-editable in Phase 1:

**Standardized Categories:** Pantry, Cleaning Materials, Stationery, Bathroom Supplies, Miscellaneous.

**Standardized Units:** Liters, Kg, Rolls, Boxes, Units, Sachets, Packets, Pieces, Bags.

**Movement Reasons (Ledger tags):** Initial Stock (used only for the very first delivery ever logged for a product), Routine Delivery, Routine Consumption, Event Usage, Emergency Usage, Maintenance, Damaged/Wasted. *(Transfer entries carry no reason — they use from/to location instead.)*

**Priority Tags (per product):** Emergency (never run out — e.g., tissue paper, hand soap), Necessary (standard restock), Optional (nice-to-have, lower alert urgency).

---

## 8. Database Schema (Supabase / PostgreSQL)

This schema is built fresh for SCMS — it does not reuse any structure from prior/reference projects.

```sql
-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
-- Created via Edge Function using Supabase Admin API when Admin creates a CEM.
-- auth.users.email = company login email (e.g., cem@canvas.com)
-- profiles.personal_email = personal Gmail, contact-only, never used for login/recovery
create table profiles (
  id uuid primary key references auth.users(id),
  full_name text not null,
  role text not null check (role in ('admin', 'cem')),
  personal_email text,          -- personal Gmail, contact only
  phone text,
  created_at timestamptz default now()
);

-- ============================================
-- CEM PRIVATE NOTE (single overwritable sticky note per CEM)
-- ============================================
create table cem_notes (
  cem_id uuid primary key references profiles(id),
  content text default '',
  updated_at timestamptz default now()
);

-- ============================================
-- BUILDINGS
-- ============================================
create table buildings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================
-- FLOORS (includes warehouse as a floor_type)
-- ============================================
create table floors (
  id uuid primary key default gen_random_uuid(),
  building_id uuid references buildings(id) not null,
  name text not null,
  floor_type text not null check (floor_type in ('warehouse', 'floor')),
  created_at timestamptz default now(),
  unique(building_id, name)
);

-- Enforce exactly one warehouse per building
create unique index one_warehouse_per_building
  on floors(building_id)
  where floor_type = 'warehouse';

-- ============================================
-- CEM TO BUILDING ASSIGNMENT (many-to-many)
-- ============================================
create table cem_building_assignments (
  id uuid primary key default gen_random_uuid(),
  cem_id uuid references profiles(id) not null,
  building_id uuid references buildings(id) not null,
  unique(cem_id, building_id)
);

-- ============================================
-- PRODUCT CATALOG (per building, CEM-owned)
-- ============================================
create table products (
  id uuid primary key default gen_random_uuid(),
  building_id uuid references buildings(id) not null,
  name text not null,
  name_normalized text generated always as (lower(trim(name))) stored,
  model text,
  category text not null check (category in
    ('Pantry','Cleaning Materials','Stationery','Bathroom Supplies','Miscellaneous')),
  unit text not null check (unit in
    ('Liters','Kg','Rolls','Boxes','Units','Sachets','Packets','Pieces','Bags')),
  priority text not null check (priority in ('Emergency','Necessary','Optional')),
  vendor_name text,
  current_price_per_unit numeric not null default 0 check (current_price_per_unit >= 0),
  low_stock_threshold numeric check (low_stock_threshold is null or low_stock_threshold >= 0),
  created_by uuid references profiles(id) not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(building_id, name_normalized)   -- enforces "Water" = "WAter" dedup
);

-- ============================================
-- LIVE STOCK PER PRODUCT PER LOCATION
-- ============================================
create table inventory_stock (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) not null,
  floor_id uuid references floors(id) not null,
  current_stock numeric not null default 0 check (current_stock >= 0),
  updated_at timestamptz default now(),
  unique(product_id, floor_id)
);

-- ============================================
-- LEDGER (append-only, source of truth)
-- ============================================
create table ledger_entries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) not null,
  building_id uuid references buildings(id) not null,
  entry_type text not null check (entry_type in ('delivery','consumption','transfer')),

  -- delivery / consumption use floor_id; transfer uses from/to
  floor_id uuid references floors(id),
  from_floor_id uuid references floors(id),
  to_floor_id uuid references floors(id),

  quantity numeric not null check (quantity > 0),

  -- price fields populated for delivery only (historical cost paid);
  -- always null for transfer/consumption in Phase 1/2
  price_per_unit numeric,
  total_price numeric,

  reason text check (reason in
    ('Initial Stock','Routine Delivery','Routine Consumption','Event Usage',
     'Emergency Usage','Maintenance','Damaged/Wasted')),

  logged_by uuid references profiles(id) not null,
  logged_at timestamptz default now(),
  notes text,

  check (
    (entry_type = 'delivery' and floor_id is not null and from_floor_id is null and to_floor_id is null)
    or (entry_type = 'consumption' and floor_id is not null and from_floor_id is null and to_floor_id is null)
    or (entry_type = 'transfer' and floor_id is null and from_floor_id is not null and to_floor_id is not null)
  )
);

-- ============================================
-- ALERTS (system-generated only)
-- ============================================
create table alerts (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) not null,
  building_id uuid references buildings(id) not null,
  floor_id uuid references floors(id) not null,
  alert_type text not null default 'low_stock' check (alert_type in ('low_stock')),
  is_resolved boolean default false,
  created_at timestamptz default now()
);
```

### Row Level Security (RLS)

- **CEMs:** read/write only on rows tied to buildings in their `cem_building_assignments`. Full CRUD on `products` (create + edit) for their buildings. Insert-only on `inventory_stock` updates and `ledger_entries` for their buildings. Full read/write on their own `cem_notes` row only.
- **Admin:** full read access everywhere. Write access only to `buildings`, `floors`, `cem_building_assignments`, and `products.is_active` (deactivate only — no insert/update of any other product field).
- **`ledger_entries`:** insert-only for everyone — no update, no delete policy at all, enforced at the RLS level, guaranteeing the audit trail can never be tampered with.
- **CEM account creation:** performed via a privileged Edge Function using the Supabase Admin API (service role key) — Admin cannot directly insert into `auth.users` from the client. The function creates the `auth.users` record (login email = company email) and the matching `profiles` row (`role = 'cem'`) in one transaction.

---

## 9. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| State/Data | TanStack Query (server state), Zustand (light local UI state) |
| Forms | React Hook Form |
| Charts | Recharts |
| Database + Auth | Supabase (PostgreSQL, Supabase Auth, Row Level Security) |
| Backend logic | Supabase Edge Functions (Deno) — CEM account creation, alert generation, PDF/Excel export |
| Backend fallback | GCP Cloud Functions / Cloud Run — only if a workload exceeds Supabase Edge Function limits (execution time, memory, or scheduled cron-style jobs) |
| Hosting (frontend) | Vercel |
| File exports | Generated client-side or via Edge Function, stored temporarily in Supabase Storage |

**Decision rule:** Start everything in Supabase Edge Functions. Only reach for GCP if a genuine limitation is hit. Don't stand up a GCP backend on day one.

---

## 10. UI/UX Principles

- **10.1** 2-click rule: Any inventory action (delivery, consumption, or transfer) must be completable in 2 taps + 1 confirm, maximum.
- **10.2** Big, obvious buttons. No icon-only actions without a text label.
- **10.3** Numeric keypad by default for all quantity/cost fields.
- **10.4** One primary action per screen.
- **10.5** Instant visual confirmation after every action (full-screen green checkmark or toast).
- **10.6** No jargon. "Delivery Arrived" and "Update Stock" — not "Log Inbound Transaction."
- **10.7** Color-coded stock status everywhere: **green** (healthy), **yellow** (low stock), **grey** (no threshold set — distinct from healthy, so an unmonitored item is never mistaken for a confirmed-healthy one).
- **10.8** Mobile-first, responsive up to desktop for Admin dashboards.

### Branding
- Primary color: Canvas purple — `#6500D6` (extracted from official logo file, confirmed).
- Canvas Workspace logo (provided: `Purple_logo_transparent.png`), top-left of every screen, on white/light background.
- Neutral, light background (white/very light gray) — purple reserved for actions and highlights only.
- Clean sans-serif typography (Inter or similar) — no decorative fonts.

---

## 11. Screens / Pages

### CEM App
1. **Login** — email + password, "Remember me," "Change Password" option.
2. **Building Selector** — only shown if CEM manages more than one building; large tappable cards.
3. **Location Selector** — dropdown: Warehouse / specific Floor / All Floors.
4. **Today's Check-In (Home)** — checklist of products for the selected location, grouped by category, color-coded status, contextual action buttons (2 for floor, 3 for warehouse).
5. **Log Delivery** — quantity + price per unit (pre-filled with last used price, editable, shown as "Last time: ₹X/unit"), auto-calculated total, confirm screen.
6. **Log Consumption/Update Stock** — quantity used + reason, confirm screen. Hard-blocked if over available stock.
7. **Log Transfer Stock** — quantity + from/to location, confirm screen. Hard-blocked if over available stock.
8. **Add New Product** — name (soft dedup check against existing names in that building), model, category, unit, priority, threshold (optional), vendor name, price per unit.
9. **Edit Product** — same fields as above, editable anytime, CEM-only.
10. **My Ledger** — scrollable list of past entries for their building(s), filterable by date/product.
11. **Alerts** — list of active low-stock alerts for their building(s).
12. **My Note** — single private sticky note, overwritable, visible only to that CEM.

### Admin Dashboard
1. **Login**
2. **Overview Dashboard** — all buildings at a glance (with floor selector), stock health summary, active alerts (clickable), total spend (filterable by day/week/month/custom range).
3. **Building Detail View** — drill into one building's full product list, stock levels by location, and recent ledger activity.
4. **Analytics** — spend by category/building/time period, top-consumed products, usage variation, trend charts (Recharts).
5. **Manage Buildings & Floors** — CRUD for buildings and floors (warehouse floor excluded — system-managed).
6. **Manage CEM Assignments** — assign/reassign CEMs to buildings; **create new CEM accounts** (name, company email/user_id, temporary password, personal Gmail as contact-only field).
7. **Product Catalog** — read-only list across buildings, deactivate toggle only.
8. **Ledger History** (three views):
   - **Purchase/Delivery History** — `date | time | product name | model | building | quantity | unit | price per unit | total price | CEM | notes | vendor` — filterable by date range (day/week/month/custom), product, building, floor, CEM.
   - **Transfer History** — `date | time | product name | model | building | from | to | quantity | unit | CEM | notes` — no price columns.
   - **Consume/Update History** — `date | time | product name | model | building | floor | quantity used | unit | CEM | notes` — no price columns.
9. **Reports & Export** — PDF/Excel, **Purchase/Delivery history only** in Phase 1/2, filterable by date range, building, category, product.

*Note: price per unit shown in Purchase History reflects the price actually paid at that specific delivery (stored permanently on that ledger row) — not the product's current live price, since delivery is the one entry type that records historical cost.*

---

## 12. Alerts Logic

- **Low Stock:** `current_stock <= low_stock_threshold` at that location → yellow flag. If no threshold is set, no alert is generated and the item displays as "No Threshold Set" (grey) — never shown as healthy.
- **Heavy/Unusual Usage:** deferred to Phase 3.
- Alerts are system-generated on every relevant ledger insert (via Edge Function) — never manually created.

---

## 13. Reporting & Export

- Available to Admin only.
- **Phase 1/2 scope: Purchase/Delivery history only.**
- Filters: date range, building, category, product.
- Report contents: date, quantity delivered, price per unit, total price — per product, summarized per building.

---

## 14. Future Roadmap (Not Phase 1)

**Phase 2 — Smart Operations:** Approval workflows for large stock changes, formal vendor management, automated WhatsApp alert integration.

**Phase 3 — Intelligent Consumables:** Heavy/Unusual Usage alerts with configurable multipliers, price visibility on transfer/consumption ledger entries, weighted-average price calculation, AI-driven consumption insights, predictive inventory forecasting, dynamic minimum-stock thresholds, smart CEM reorder recommendations, inter-building stock transfers.

---

## 15. Build Notes for Claude Code

- Build the CEM mobile check-in flow first — the core loop and highest-value screen.
- Use Supabase Auth out of the box; CEM account creation goes through a privileged Edge Function (Admin API), never direct client-side inserts into `auth.users`.
- Enforce RLS policies exactly as specified in Section 8 — ledger integrity depends on insert-only access.
- One reusable Button, Card, and Modal pattern — no UI variety for its own sake.
- Seed categories, units, and movement reasons as fixed enums/constants — not user-editable in Phase 1.
- Enforce hard blocks at both UI and DB level: consumption/transfer quantity can never exceed source location's current stock; stock and price values can never go negative.
- Enforce product name dedup (normalized name, unique per building) at both UI (soft warning on creation) and DB (hard unique constraint) level.
- New floors get **eager** `inventory_stock` rows — a 0-quantity row is created immediately for every active product in that building when a floor is created — but these are hidden from the CEM's checklist view until stock at that location is greater than 0.
- Price per unit calculation: Phase 1/2 uses **current price only** (`total_price = quantity × current_price_per_unit`, captured at the moment of delivery). Weighted-average calculation is a Phase 3 item — do not implement early.

---

*Document version: 1.0 — Finalized after full requirements review with stakeholder.*
