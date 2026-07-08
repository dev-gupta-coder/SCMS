-- ============================================================
-- SCMS — Canvas Workspace
-- Migration 0005: create_product RPC
-- ============================================================
-- A new product needs an inventory_stock row (current_stock = 0) for every
-- existing floor of its building the moment it's created — the same
-- invariant that floor creation already maintains in the other direction
-- (Build Notes: new floors get eager 0-stock rows for every active
-- product). Without this, the very first delivery/consumption/transfer for
-- a freshly created product would UPDATE 0 rows and silently no-op, since
-- those RPCs (0002-0004) never INSERT into inventory_stock. Bundling both
-- writes in one transaction also means a product can never exist without
-- its stock rows. SECURITY INVOKER: no new access, existing RLS on
-- products/inventory_stock still applies.

create or replace function create_product(
  p_building_id uuid,
  p_name text,
  p_model text,
  p_category text,
  p_unit text,
  p_priority text,
  p_vendor_name text,
  p_price_per_unit numeric,
  p_low_stock_threshold numeric
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_product_id uuid;
begin
  insert into products (
    building_id, name, model, category, unit, priority,
    vendor_name, current_price_per_unit, low_stock_threshold, created_by
  ) values (
    p_building_id, p_name, p_model, p_category, p_unit, p_priority,
    p_vendor_name, p_price_per_unit, p_low_stock_threshold, auth.uid()
  )
  returning id into v_product_id;

  insert into inventory_stock (product_id, floor_id, current_stock)
  select v_product_id, f.id, 0
  from floors f
  where f.building_id = p_building_id;

  return v_product_id;
end;
$$;

grant execute on function create_product(uuid, text, text, text, text, text, text, numeric, numeric) to authenticated;
