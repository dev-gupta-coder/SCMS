-- ============================================================
-- Migration 0011: Products auto-link to ALL buildings on creation.
--
-- Threshold/is_active per building are UNCHANGED (building_products already
-- handles this correctly). The only change: create_product now links to
-- every building at once, and new buildings retroactively inherit every
-- existing active product.
-- ============================================================

-- ---------- 1. create_product: link to ALL buildings, not just the creator's ----------
-- SECURITY DEFINER, not INVOKER: the whole point of this function is to
-- write building_products/inventory_stock rows for buildings the calling
-- CEM has no RLS access to. Under INVOKER this silently under-links —
-- confirmed empirically: the `insert ... select ... from buildings`/
-- `from floors` below is itself RLS-scoped to what the calling CEM can
-- SELECT (has_building_access), so a CEM assigned to only one building
-- would only ever populate that one building, no error raised, just a
-- silently incomplete link. DEFINER bypasses that, so the authorization
-- check that RLS would normally provide (is_assigned_cem(), matching the
-- "Assigned CEMs create products" policy this bypasses) is replicated
-- explicitly below instead.
create or replace function create_product(
  p_building_id uuid, p_name text, p_model text, p_category text,
  p_unit text, p_priority text, p_vendor_name text,
  p_price_per_unit numeric, p_low_stock_threshold numeric
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_product_id uuid;
begin
  if not is_assigned_cem() then
    raise exception 'Only a CEM with at least one building assignment may create products';
  end if;

  insert into products (name, model, category, unit, priority,
                        vendor_name, current_price_per_unit, created_by)
  values (p_name, p_model, p_category, p_unit, p_priority,
          p_vendor_name, p_price_per_unit, auth.uid())
  returning id into v_product_id;

  -- Link to every building. Only the creator's own building gets the
  -- threshold they entered; every other building starts with threshold
  -- null (its own CEM sets it later) — this matches how threshold has
  -- always worked, just applied across all buildings now instead of one.
  insert into building_products (building_id, product_id, low_stock_threshold)
  select b.id, v_product_id,
         case when b.id = p_building_id then p_low_stock_threshold else null end
  from buildings b
  where b.is_active;

  -- Eager-stock every floor of every building, same pattern create_floor
  -- already uses in reverse.
  insert into inventory_stock (product_id, floor_id, current_stock)
  select v_product_id, f.id, 0
  from floors f
  join buildings b on b.id = f.building_id
  where b.is_active;

  return v_product_id;
end; $$;

-- ---------- 2. New buildings retroactively inherit every existing active product ----------
-- SECURITY DEFINER, not INVOKER: confirmed empirically that INVOKER fails
-- outright here — Admin has no INSERT policy on building_products at all
-- (only CEM's own has_building_access-scoped one exists), so the insert
-- below raised "new row violates row-level security policy" even after
-- the is_admin() check passed. The is_admin() check is what stands in for
-- RLS here, same reasoning as create_product above.
create or replace function link_all_products_to_building(p_building_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not is_admin() then
    raise exception 'Only Admin may create buildings';
  end if;

  insert into building_products (building_id, product_id)
  select p_building_id, p.id
  from products p
  where p.is_active and p.merged_into_product_id is null
  on conflict (building_id, product_id) do nothing;

  insert into inventory_stock (product_id, floor_id, current_stock)
  select bp.product_id, f.id, 0
  from building_products bp
  join floors f on f.building_id = p_building_id
  where bp.building_id = p_building_id
  on conflict (product_id, floor_id) do nothing;
end; $$;
grant execute on function link_all_products_to_building(uuid) to authenticated;

-- Note: call link_all_products_to_building(new_building_id) right after
-- inserting a new building — wire this into whatever Admin flow currently
-- creates buildings (see prompt for the exact call site).

-- link_product_to_building is left in place, unused by the default create
-- flow now, but still callable — kept as a safety net for the rare case a
-- building/product link is somehow missing (e.g. a building created before
-- this migration existed).

-- ---------- 3. One-time backfill: buildings/products that existed before this migration ----------
-- Everything above only changes behavior going forward. Without this,
-- buildings created before 0011 would stay stuck with whatever partial
-- catalog they happened to have, inconsistent with every building created
-- after. Can't call link_all_products_to_building() here — it checks
-- is_admin() via auth.uid(), which is null in a migration's execution
-- context (migrations run as the postgres role, not through PostgREST
-- with a JWT). Same insert logic, applied directly, for every currently
-- active building against every currently live product. Runs once, ever
-- — migrations don't replay — and is itself idempotent (on conflict do
-- nothing) in case it's ever re-run by hand.
insert into building_products (building_id, product_id)
select b.id, p.id
from buildings b
cross join products p
where b.is_active and p.is_active and p.merged_into_product_id is null
on conflict (building_id, product_id) do nothing;

insert into inventory_stock (product_id, floor_id, current_stock)
select bp.product_id, f.id, 0
from building_products bp
join floors f on f.building_id = bp.building_id
where bp.is_active
on conflict (product_id, floor_id) do nothing;