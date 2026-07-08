-- ============================================================
-- SCMS — Canvas Workspace
-- Migration 0003: log_consumption RPC
-- ============================================================
-- Same rationale as migration 0002 (log_delivery): bundles the ledger insert
-- and the stock decrement into one transaction so a dropped mobile
-- connection can't leave inventory_stock out of sync with the ledger.
-- The existing `inventory_stock.current_stock >= 0` CHECK constraint is the
-- DB-level hard block against over-consumption (PRD hard-block rule) — the
-- UI blocks it first, this is the final guard. SECURITY INVOKER: no new
-- access, existing RLS on ledger_entries/inventory_stock still applies.

create or replace function log_consumption(
  p_product_id uuid,
  p_building_id uuid,
  p_floor_id uuid,
  p_quantity numeric,
  p_reason text
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_ledger_id uuid;
begin
  if p_reason not in (
    'Routine Consumption', 'Event Usage', 'Emergency Usage', 'Maintenance', 'Damaged/Wasted'
  ) then
    raise exception 'Invalid reason for a consumption entry: %', p_reason;
  end if;

  insert into ledger_entries (
    product_id, building_id, floor_id, entry_type,
    quantity, reason, logged_by
  ) values (
    p_product_id, p_building_id, p_floor_id, 'consumption',
    p_quantity, p_reason, auth.uid()
  )
  returning id into v_ledger_id;

  -- current_stock's own `>= 0` check constraint rejects (and rolls back)
  -- any attempt to consume more than what's on hand at this location.
  update inventory_stock
  set current_stock = current_stock - p_quantity,
      updated_at = now()
  where product_id = p_product_id and floor_id = p_floor_id;

  return v_ledger_id;
end;
$$;

grant execute on function log_consumption(uuid, uuid, uuid, numeric, text) to authenticated;
