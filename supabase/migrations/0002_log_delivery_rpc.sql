-- ============================================================
-- SCMS — Canvas Workspace
-- Migration 0002: log_delivery RPC
-- ============================================================
-- Bundles the three writes a delivery requires (ledger insert, live-price
-- update, warehouse stock increment) into one DB transaction so a dropped
-- connection mid-flow (realistic on a CEM's phone) can never leave
-- inventory_stock out of sync with the ledger. Runs SECURITY INVOKER so the
-- calling CEM's existing RLS policies still gate every write — this
-- function adds no new access, just atomicity.

create or replace function log_delivery(
  p_product_id uuid,
  p_building_id uuid,
  p_floor_id uuid,
  p_quantity numeric,
  p_price_per_unit numeric
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_reason text;
  v_ledger_id uuid;
begin
  if not exists (
    select 1 from floors where id = p_floor_id and floor_type = 'warehouse'
  ) then
    raise exception 'Delivery can only be logged at the warehouse floor';
  end if;

  select case
    when exists (
      select 1 from ledger_entries
      where product_id = p_product_id and entry_type = 'delivery'
    ) then 'Routine Delivery'
    else 'Initial Stock'
  end into v_reason;

  insert into ledger_entries (
    product_id, building_id, floor_id, entry_type,
    quantity, price_per_unit, total_price, reason, logged_by
  ) values (
    p_product_id, p_building_id, p_floor_id, 'delivery',
    p_quantity, p_price_per_unit, p_quantity * p_price_per_unit,
    v_reason, auth.uid()
  )
  returning id into v_ledger_id;

  update products
  set current_price_per_unit = p_price_per_unit
  where id = p_product_id;

  update inventory_stock
  set current_stock = current_stock + p_quantity,
      updated_at = now()
  where product_id = p_product_id and floor_id = p_floor_id;

  return v_ledger_id;
end;
$$;

grant execute on function log_delivery(uuid, uuid, uuid, numeric, numeric) to authenticated;
