-- ============================================================
-- Migration 0008: Products go global.
--
-- Global (any CEM with >=1 building assignment can edit; Admin can only
-- deactivate/reactivate, never edit fields): name, model, category, unit,
-- priority, price per unit, vendor.
--
-- Per-building only (via building_products link): is_active (building's own
-- show/hide), low_stock_threshold.
--
-- Duplicate merge uses merged_into_product_id, NOT a ledger repoint — this
-- migration never runs an UPDATE against ledger_entries. Old ledger rows
-- keep pointing at their original (possibly now-merged) product row exactly
-- as written; merged rows are simply excluded from every live-catalog view.
--
-- Pre-flight: the Part 3 data check (name+model matches across buildings
-- with differing category/unit) returned zero rows against canvas-scms-2.
-- Safe to run the automatic merge below as-is.
-- ============================================================

-- ---------- 1. New lightweight per-building link table ----------
create table building_products (
  id uuid primary key default gen_random_uuid(),
  building_id uuid references buildings(id) not null,
  product_id uuid references products(id) not null,
  is_active boolean not null default true,
  low_stock_threshold numeric
    check (low_stock_threshold is null or low_stock_threshold >= 0),
  created_at timestamptz default now(),
  unique(building_id, product_id)
);
alter table building_products enable row level security;

-- ---------- 2. Merge tracking column (replaces ledger repoint) ----------
alter table products add column merged_into_product_id uuid references products(id);

-- ---------- 3. Backfill links from today's per-building rows ----------
insert into building_products (building_id, product_id, is_active, low_stock_threshold)
select building_id, id, is_active, low_stock_threshold
from products;

-- ---------- 4. Identify and merge cross-building duplicates (name + model) ----------
-- Canonical row = oldest created_at (stable tie-break on id).
create temp table product_canonical as
select d.id as dup_id, c.id as canonical_id
from products d
join lateral (
  select id from products c
  where c.name_normalized = d.name_normalized
    and coalesce(lower(trim(c.model)), '') = coalesce(lower(trim(d.model)), '')
  order by c.created_at asc, c.id asc
  limit 1
) c on true
where d.id <> c.id;

-- Canonical row inherits the most recently set price/vendor among the group.
update products p
set current_price_per_unit = latest.current_price_per_unit,
    vendor_name            = latest.vendor_name
from (
  select distinct on (name_normalized, coalesce(lower(trim(model)), ''))
         name_normalized,
         coalesce(lower(trim(model)), '') as model_normalized,
         current_price_per_unit, vendor_name
  from products
  order by name_normalized, coalesce(lower(trim(model)), ''), created_at desc
) latest
where p.name_normalized = latest.name_normalized
  and coalesce(lower(trim(p.model)), '') = latest.model_normalized
  and p.id in (select canonical_id from product_canonical union select dup_id from product_canonical);

-- Repoint CURRENT-STATE tables only (safe to rewrite — not an audit trail).
update building_products bp set product_id = pc.canonical_id
  from product_canonical pc
  where bp.product_id = pc.dup_id
  and not exists (
    select 1 from building_products bp2
    where bp2.building_id = bp.building_id and bp2.product_id = pc.canonical_id
  );
delete from building_products bp using product_canonical pc
  where bp.product_id = pc.dup_id;  -- drop any leftover unrepointed dup links

update inventory_stock s set product_id = pc.canonical_id
  from product_canonical pc
  where s.product_id = pc.dup_id
  and not exists (
    select 1 from inventory_stock s2
    where s2.floor_id = s.floor_id and s2.product_id = pc.canonical_id
  );
delete from inventory_stock s using product_canonical pc
  where s.product_id = pc.dup_id;  -- drop any leftover unrepointed dup rows

-- ledger_entries and alerts are NEVER rewritten. Mark the duplicate as
-- merged instead — historical rows keep their original product_id forever.
update products p
set merged_into_product_id = pc.canonical_id,
    is_active = false
from product_canonical pc
where p.id = pc.dup_id;

-- ---------- 5. products: shed per-building columns, new uniqueness ----------
-- Old building_id-scoped policies must go before the column they reference
-- does (moved up from section 7, otherwise dropping building_id fails: a
-- column can't be dropped while a policy's USING/WITH CHECK still reads it).
drop policy "CEM reads products of assigned buildings"   on products;
drop policy "CEM creates products in assigned buildings" on products;
drop policy "CEM updates products in assigned buildings" on products;
drop policy "Admin deactivates products" on products;

alter table products drop constraint products_building_id_name_normalized_key;
alter table products drop column building_id;
alter table products drop column low_stock_threshold;

-- Reset the global switch for everything that ISN'T a merged-away duplicate.
update products set is_active = true where merged_into_product_id is null;

-- Uniqueness on name + model, only among live (non-merged) rows.
create unique index products_name_model_live_key
  on products (name_normalized, coalesce(lower(trim(model)), ''))
  where merged_into_product_id is null;

-- ---------- 6. Helper: does this CEM have at least one building assignment? ----------
create or replace function is_assigned_cem()
returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from profiles pr
    join cem_building_assignments a on a.cem_id = pr.id
    where pr.id = auth.uid() and pr.role = 'cem'
  );
$$;

-- ---------- 7. RLS: products ----------
-- (old building_id-scoped policy drops moved to section 5, ahead of the
-- column drop they depend on)

-- Global read: any CEM with >=1 building assignment can see every product
-- row, merged or not. A CEM with zero assignments sees nothing — per your
-- point C. RLS is a security boundary only ("can this CEM ever see this
-- row"), not a display filter — "live" (non-merged) is a query-level
-- concern from here on: the search-as-you-type reuse lookup and any
-- product picker/catalog list must add their own
-- `.is('merged_into_product_id', null)` filter, but a ledger-history join
-- (`ledger_entries -> products`) deliberately must NOT be filtered this
-- way, or historical rows pointing at a since-merged product lose their
-- product name/unit/model when read back.
create policy "Assigned CEMs read products"
  on products for select using (is_assigned_cem());

create policy "Admin reads all products"
  on products for select using (is_admin());

create policy "Assigned CEMs create products"
  on products for insert with check (is_assigned_cem() and created_by = auth.uid());

-- Field edits: assigned CEMs only. Unlike the read policy above, the
-- merged_into_product_id filter stays here on purpose — editing a
-- merged-away (dead) row is never valid, so this is a real permission
-- boundary, not a display concern. Admin is deliberately NOT granted an
-- update policy on products — deactivate is a separate is_active-only path
-- below, never a general field edit.
create policy "Assigned CEMs edit products"
  on products for update using (is_assigned_cem() and merged_into_product_id is null);

-- Admin's global kill switch. RLS is row-level, not column-level, so this
-- is enforced procedurally: Admin only ever calls set_product_active(),
-- never a raw table update, to stay within "deactivate only."
create policy "Admin toggles product active state"
  on products for update using (is_admin());

create or replace function set_product_active(p_product_id uuid, p_is_active boolean)
returns void language plpgsql security invoker as $$
begin
  if not is_admin() then
    raise exception 'Only Admin may deactivate/reactivate a product';
  end if;
  update products set is_active = p_is_active
    where id = p_product_id and merged_into_product_id is null;
end; $$;
grant execute on function set_product_active(uuid, boolean) to authenticated;

-- ---------- 8. RLS: building_products ----------
create policy "Admin reads building_products"
  on building_products for select using (is_admin());
create policy "CEM reads links of assigned buildings"
  on building_products for select using (has_building_access(building_id));
create policy "CEM creates links in assigned buildings"
  on building_products for insert with check (has_building_access(building_id));
create policy "CEM updates links in assigned buildings"
  on building_products for update using (has_building_access(building_id));
-- No Admin write policy here by design — a building's own is_active/
-- threshold belongs to that building's CEM, not Admin.

-- ---------- 9. RPCs ----------
create or replace function create_product(
  p_building_id uuid, p_name text, p_model text, p_category text,
  p_unit text, p_priority text, p_vendor_name text,
  p_price_per_unit numeric, p_low_stock_threshold numeric
) returns uuid language plpgsql security invoker as $$
declare v_product_id uuid;
begin
  insert into products (name, model, category, unit, priority,
                        vendor_name, current_price_per_unit, created_by)
  values (p_name, p_model, p_category, p_unit, p_priority,
          p_vendor_name, p_price_per_unit, auth.uid())
  returning id into v_product_id;

  insert into building_products (building_id, product_id, low_stock_threshold)
  values (p_building_id, v_product_id, p_low_stock_threshold);

  insert into inventory_stock (product_id, floor_id, current_stock)
  select v_product_id, f.id, 0 from floors f where f.building_id = p_building_id;

  return v_product_id;
end; $$;

create or replace function link_product_to_building(
  p_building_id uuid, p_product_id uuid, p_low_stock_threshold numeric
) returns uuid language plpgsql security invoker as $$
declare v_link_id uuid;
begin
  insert into building_products (building_id, product_id, low_stock_threshold)
  values (p_building_id, p_product_id, p_low_stock_threshold)
  on conflict (building_id, product_id)
    do update set is_active = true,
                  low_stock_threshold = excluded.low_stock_threshold
  returning id into v_link_id;

  insert into inventory_stock (product_id, floor_id, current_stock)
  select p_product_id, f.id, 0 from floors f where f.building_id = p_building_id
  on conflict (product_id, floor_id) do nothing;

  return v_link_id;
end; $$;
grant execute on function link_product_to_building(uuid, uuid, numeric) to authenticated;

-- create_floor (defined in 0006): eager-stock now walks the link table.
create or replace function create_floor(p_building_id uuid, p_name text, p_floor_type text)
returns uuid language plpgsql security invoker as $$
declare v_floor_id uuid;
begin
  if not is_admin() then
    raise exception 'Only Admin may create floors';
  end if;
  insert into floors (building_id, name, floor_type)
  values (p_building_id, p_name, p_floor_type)
  returning id into v_floor_id;

  insert into inventory_stock (product_id, floor_id, current_stock)
  select bp.product_id, v_floor_id, 0
  from building_products bp
  join products p on p.id = bp.product_id
  where bp.building_id = p_building_id and bp.is_active and p.is_active
    and p.merged_into_product_id is null;

  return v_floor_id;
end; $$;

-- evaluate_stock_alert (defined in 0007): threshold is per-building now.
create or replace function evaluate_stock_alert(p_product_id uuid, p_building_id uuid, p_floor_id uuid)
returns void language plpgsql security invoker as $$
declare
  v_threshold numeric;
  v_stock numeric;
begin
  select low_stock_threshold into v_threshold
    from building_products
    where product_id = p_product_id and building_id = p_building_id;

  if v_threshold is null then
    return; -- no threshold set for this building, no alert possible
  end if;

  select current_stock into v_stock
    from inventory_stock
    where product_id = p_product_id and floor_id = p_floor_id;

  if v_stock <= v_threshold then
    insert into alerts (product_id, building_id, floor_id, alert_type, is_resolved)
    values (p_product_id, p_building_id, p_floor_id, 'low_stock', false)
    on conflict do nothing;
  else
    update alerts set is_resolved = true
      where product_id = p_product_id and building_id = p_building_id
        and floor_id = p_floor_id and alert_type = 'low_stock' and not is_resolved;
  end if;
end; $$;