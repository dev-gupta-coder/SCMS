-- ============================================================
-- SCMS — Canvas Workspace
-- Migration 0001: Initial schema + RLS
-- ============================================================

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
create table profiles (
  id uuid primary key references auth.users(id),
  full_name text not null,
  role text not null check (role in ('admin', 'cem')),
  personal_email text,          -- personal Gmail, contact only, never used for login
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
  unique(building_id, name_normalized)
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

  floor_id uuid references floors(id),
  from_floor_id uuid references floors(id),
  to_floor_id uuid references floors(id),

  quantity numeric not null check (quantity > 0),

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

-- ============================================================
-- HELPER FUNCTION: is the current user an admin?
-- ============================================================
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================
-- HELPER FUNCTION: does the current user (CEM) have access to this building?
-- ============================================================
create or replace function has_building_access(check_building_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from cem_building_assignments
    where cem_id = auth.uid() and building_id = check_building_id
  );
$$;

-- ============================================================
-- ENABLE RLS
-- ============================================================
alter table profiles enable row level security;
alter table cem_notes enable row level security;
alter table buildings enable row level security;
alter table floors enable row level security;
alter table cem_building_assignments enable row level security;
alter table products enable row level security;
alter table inventory_stock enable row level security;
alter table ledger_entries enable row level security;
alter table alerts enable row level security;

-- ============================================================
-- POLICIES: profiles
-- ============================================================
create policy "Users can read their own profile"
  on profiles for select using (id = auth.uid());
create policy "Admin can read all profiles"
  on profiles for select using (is_admin());
-- Inserts happen only via Edge Function (service role), not covered by client policies.

-- ============================================================
-- POLICIES: cem_notes
-- ============================================================
create policy "CEM reads own note"
  on cem_notes for select using (cem_id = auth.uid());
create policy "CEM inserts own note"
  on cem_notes for insert with check (cem_id = auth.uid());
create policy "CEM updates own note"
  on cem_notes for update using (cem_id = auth.uid());

-- ============================================================
-- POLICIES: buildings
-- ============================================================
create policy "Admin full read buildings"
  on buildings for select using (is_admin());
create policy "CEM reads assigned buildings"
  on buildings for select using (has_building_access(id));
create policy "Admin manages buildings"
  on buildings for insert with check (is_admin());
create policy "Admin updates buildings"
  on buildings for update using (is_admin());

-- ============================================================
-- POLICIES: floors
-- ============================================================
create policy "Admin full read floors"
  on floors for select using (is_admin());
create policy "CEM reads floors of assigned buildings"
  on floors for select using (has_building_access(building_id));
create policy "Admin manages floors"
  on floors for insert with check (is_admin());
create policy "Admin updates floors"
  on floors for update using (is_admin());

-- ============================================================
-- POLICIES: cem_building_assignments
-- ============================================================
create policy "Admin full read assignments"
  on cem_building_assignments for select using (is_admin());
create policy "CEM reads own assignments"
  on cem_building_assignments for select using (cem_id = auth.uid());
create policy "Admin manages assignments"
  on cem_building_assignments for insert with check (is_admin());
create policy "Admin deletes assignments"
  on cem_building_assignments for delete using (is_admin());

-- ============================================================
-- POLICIES: products (CEM-owned, admin read + deactivate only)
-- ============================================================
create policy "Admin full read products"
  on products for select using (is_admin());
create policy "CEM reads products of assigned buildings"
  on products for select using (has_building_access(building_id));
create policy "CEM creates products in assigned buildings"
  on products for insert with check (has_building_access(building_id));
create policy "CEM updates products in assigned buildings"
  on products for update using (has_building_access(building_id));
create policy "Admin deactivates products"
  on products for update using (is_admin());

-- ============================================================
-- POLICIES: inventory_stock
-- ============================================================
create policy "Admin full read inventory_stock"
  on inventory_stock for select using (is_admin());
create policy "CEM reads stock of assigned buildings"
  on inventory_stock for select using (
    exists (select 1 from floors f where f.id = floor_id and has_building_access(f.building_id))
  );
create policy "CEM writes stock of assigned buildings"
  on inventory_stock for insert with check (
    exists (select 1 from floors f where f.id = floor_id and has_building_access(f.building_id))
  );
create policy "CEM updates stock of assigned buildings"
  on inventory_stock for update using (
    exists (select 1 from floors f where f.id = floor_id and has_building_access(f.building_id))
  );

-- ============================================================
-- POLICIES: ledger_entries (INSERT-ONLY, no update/delete ever)
-- ============================================================
create policy "Admin full read ledger"
  on ledger_entries for select using (is_admin());
create policy "CEM reads ledger of assigned buildings"
  on ledger_entries for select using (has_building_access(building_id));
create policy "CEM inserts ledger entries for assigned buildings"
  on ledger_entries for insert with check (
    has_building_access(building_id) and logged_by = auth.uid()
  );
-- Intentionally NO update or delete policy on ledger_entries.

-- ============================================================
-- POLICIES: alerts (system-generated via Edge Function / service role)
-- ============================================================
create policy "Admin full read alerts"
  on alerts for select using (is_admin());
create policy "CEM reads alerts of assigned buildings"
  on alerts for select using (has_building_access(building_id));
-- Inserts/updates to alerts happen via Edge Function using service role key only.
