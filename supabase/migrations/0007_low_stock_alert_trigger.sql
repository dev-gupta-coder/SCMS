-- ============================================================
-- SCMS — Canvas Workspace
-- Migration 0007: low-stock alert generation trigger
-- ============================================================
-- PRD section 12: alerts are system-generated on every relevant ledger
-- insert, based on low_stock_threshold (skip entirely if null), and never
-- manually created — there is no RLS insert/update policy on `alerts` for
-- CEM or Admin, and no "resolve" button anywhere in the UI. The only way an
-- alert can ever be created or resolved is this trigger, which also means it
-- must resolve an alert when a later delivery/transfer brings stock back
-- above threshold, or an alert would stay "active" forever with no other
-- mechanism to clear it.
--
-- A DB trigger (not a literal Deno Edge Function) was chosen: the logic is
-- pure SQL with no external API, and firing inside the same transaction as
-- the ledger insert means it can never be skipped by a forgotten client-side
-- call or lost to a failed out-of-band HTTP request.
--
-- Prerequisite fix: an AFTER INSERT trigger reads inventory_stock as it
-- stands once the INSERT statement completes. log_delivery/log_consumption/
-- log_transfer (migrations 0002-0004) inserted into ledger_entries BEFORE
-- updating inventory_stock, so the trigger would have read the stock level
-- from *before* this transaction's own change. All three are redefined here
-- with the stock write(s) moved ahead of the ledger insert — everything
-- else about them (validation, reason logic, atomicity, RLS trust model) is
-- unchanged.

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

  update products
  set current_price_per_unit = p_price_per_unit
  where id = p_product_id;

  update inventory_stock
  set current_stock = current_stock + p_quantity,
      updated_at = now()
  where product_id = p_product_id and floor_id = p_floor_id;

  insert into ledger_entries (
    product_id, building_id, floor_id, entry_type,
    quantity, price_per_unit, total_price, reason, logged_by
  ) values (
    p_product_id, p_building_id, p_floor_id, 'delivery',
    p_quantity, p_price_per_unit, p_quantity * p_price_per_unit,
    v_reason, auth.uid()
  )
  returning id into v_ledger_id;

  return v_ledger_id;
end;
$$;

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

  -- current_stock's own `>= 0` check constraint rejects (and rolls back)
  -- any attempt to consume more than what's on hand at this location.
  update inventory_stock
  set current_stock = current_stock - p_quantity,
      updated_at = now()
  where product_id = p_product_id and floor_id = p_floor_id;

  insert into ledger_entries (
    product_id, building_id, floor_id, entry_type,
    quantity, reason, logged_by
  ) values (
    p_product_id, p_building_id, p_floor_id, 'consumption',
    p_quantity, p_reason, auth.uid()
  )
  returning id into v_ledger_id;

  return v_ledger_id;
end;
$$;

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

  insert into ledger_entries (
    product_id, building_id, entry_type,
    from_floor_id, to_floor_id, quantity, logged_by
  ) values (
    p_product_id, p_building_id, 'transfer',
    p_from_floor_id, p_to_floor_id, p_quantity, auth.uid()
  )
  returning id into v_ledger_id;

  return v_ledger_id;
end;
$$;

-- ============================================================
-- Alert evaluation for a single (product, floor) — insert an active
-- low_stock alert if none exists and stock is at/under threshold; resolve
-- one if it exists and stock has recovered. A null threshold is a no-op in
-- both directions (never alerted, so never "resolved" either).
-- ============================================================
create or replace function evaluate_stock_alert(
  p_product_id uuid,
  p_building_id uuid,
  p_floor_id uuid
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_current_stock numeric;
  v_threshold numeric;
  v_existing_alert_id uuid;
begin
  select current_stock into v_current_stock
  from inventory_stock
  where product_id = p_product_id and floor_id = p_floor_id;

  select low_stock_threshold into v_threshold
  from products
  where id = p_product_id;

  if v_threshold is null then
    return;
  end if;

  select id into v_existing_alert_id
  from alerts
  where product_id = p_product_id
    and floor_id = p_floor_id
    and alert_type = 'low_stock'
    and is_resolved = false
  limit 1;

  if v_current_stock <= v_threshold then
    if v_existing_alert_id is null then
      insert into alerts (product_id, building_id, floor_id, alert_type, is_resolved)
      values (p_product_id, p_building_id, p_floor_id, 'low_stock', false);
    end if;
  else
    if v_existing_alert_id is not null then
      update alerts set is_resolved = true where id = v_existing_alert_id;
    end if;
  end if;
end;
$$;

-- ============================================================
-- Trigger: fires after every ledger_entries insert. Delivery/consumption
-- touch one floor; transfer touches both source and destination.
-- ============================================================
create or replace function check_low_stock_alert()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if NEW.entry_type in ('delivery', 'consumption') then
    perform evaluate_stock_alert(NEW.product_id, NEW.building_id, NEW.floor_id);
  elsif NEW.entry_type = 'transfer' then
    perform evaluate_stock_alert(NEW.product_id, NEW.building_id, NEW.from_floor_id);
    perform evaluate_stock_alert(NEW.product_id, NEW.building_id, NEW.to_floor_id);
  end if;

  return NEW;
end;
$$;

drop trigger if exists ledger_entries_low_stock_check on ledger_entries;

create trigger ledger_entries_low_stock_check
  after insert on ledger_entries
  for each row
  execute function check_low_stock_alert();
