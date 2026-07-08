-- ============================================================
-- SCMS — Canvas Workspace
-- Migration 0004: log_transfer RPC
-- ============================================================
-- Same rationale as 0002/0003: one transaction for the ledger insert and
-- both stock mutations (deduct at source, add at destination), so a dropped
-- mobile connection can't leave the two inventory_stock rows out of sync
-- with each other or with the ledger. The existing
-- `inventory_stock.current_stock >= 0` CHECK is the DB-level hard block
-- against transferring more than the source has — the UI blocks it first,
-- this is the final guard. SECURITY INVOKER: no new access, existing RLS on
-- ledger_entries/inventory_stock still applies.

create or replace function log_transfer(
  p_product_id uuid,
  p_building_id uuid,
  p_from_floor_id uuid,
  p_to_floor_id uuid,
  p_quantity numeric
)
returns uuid
language plpgsql
security invoker
as $$
declare
  v_ledger_id uuid;
begin
  if p_from_floor_id = p_to_floor_id then
    raise exception 'Transfer source and destination must be different locations';
  end if;

  if not exists (select 1 from floors where id = p_from_floor_id and building_id = p_building_id)
    or not exists (select 1 from floors where id = p_to_floor_id and building_id = p_building_id)
  then
    raise exception 'Transfer locations must belong to the same building';
  end if;

  insert into ledger_entries (
    product_id, building_id, entry_type,
    from_floor_id, to_floor_id, quantity, logged_by
  ) values (
    p_product_id, p_building_id, 'transfer',
    p_from_floor_id, p_to_floor_id, p_quantity, auth.uid()
  )
  returning id into v_ledger_id;

  -- source's `current_stock >= 0` check constraint rejects (and rolls back)
  -- any attempt to transfer more than what's on hand at the source location.
  update inventory_stock
  set current_stock = current_stock - p_quantity,
      updated_at = now()
  where product_id = p_product_id and floor_id = p_from_floor_id;

  update inventory_stock
  set current_stock = current_stock + p_quantity,
      updated_at = now()
  where product_id = p_product_id and floor_id = p_to_floor_id;

  return v_ledger_id;
end;
$$;

grant execute on function log_transfer(uuid, uuid, uuid, uuid, numeric) to authenticated;
