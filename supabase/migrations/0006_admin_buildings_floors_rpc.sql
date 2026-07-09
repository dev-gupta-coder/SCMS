-- ============================================================
-- SCMS — Canvas Workspace
-- Migration 0006: Admin building/floor management RPCs
-- ============================================================

-- RLS GAP FIX: inventory_stock had no INSERT policy for Admin — only CEMs
-- (via has_building_access) could insert. Floors are Admin-created and
-- floor creation must eagerly stock existing products (same invariant as
-- product creation eagerly stocking existing floors, migration 0005), so
-- Admin needs insert rights here too. Scoped to is_admin(), same shape as
-- every other Admin policy already in 0001.
create policy "Admin writes stock"
  on inventory_stock for insert
  with check (is_admin());

-- ============================================================
-- create_building: building + its auto-created warehouse floor, atomic.
-- "Exactly one warehouse per building" (PRD 6.2) must never be violated by
-- a partial write — a building can never exist without one.
-- SECURITY INVOKER: relies on existing "Admin manages buildings" /
-- "Admin manages floors" insert policies, no new access.
-- ============================================================
create or replace function create_building(
  p_name text,
  p_address text
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_building_id uuid;
begin
  insert into buildings (name, address)
  values (p_name, p_address)
  returning id into v_building_id;

  insert into floors (building_id, name, floor_type)
  values (v_building_id, 'Warehouse', 'warehouse');

  return v_building_id;
end;
$$;

grant execute on function create_building(text, text) to authenticated;

-- ============================================================
-- create_floor: a non-warehouse floor + a 0-stock inventory_stock row for
-- every active product already in that building (Build Notes: new floors
-- get eager 0-stock rows). Without this, the first transfer/consumption
-- targeting a brand-new floor would UPDATE 0 rows and silently no-op.
-- SECURITY INVOKER: relies on "Admin manages floors" and the "Admin writes
-- stock" policy added above.
-- ============================================================
create or replace function create_floor(
  p_building_id uuid,
  p_name text
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_floor_id uuid;
begin
  insert into floors (building_id, name, floor_type)
  values (p_building_id, p_name, 'floor')
  returning id into v_floor_id;

  insert into inventory_stock (product_id, floor_id, current_stock)
  select p.id, v_floor_id, 0
  from products p
  where p.building_id = p_building_id and p.is_active = true;

  return v_floor_id;
end;
$$;

grant execute on function create_floor(uuid, text) to authenticated;
