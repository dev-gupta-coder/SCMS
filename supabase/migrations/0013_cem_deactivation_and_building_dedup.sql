-- ============================================================
-- Migration 0013: CEM deactivation (non-destructive) + building
-- name uniqueness.
--
-- PRE-FLIGHT: run this against canvas-scms-2 BEFORE applying, to check
-- for existing duplicate building names (the unique index will fail to
-- create if any exist):
--
--   select lower(trim(name)) as name_normalized, count(*), array_agg(id)
--   from buildings group by 1 having count(*) > 1;
--
-- Empty result = safe to apply as-is. Any rows returned = rename or merge
-- those buildings manually first (same manual-review principle as the
-- product merge in 0008 — do not auto-resolve building name conflicts).
-- ============================================================

-- ---------- 1. CEM deactivation (non-destructive) ----------
alter table profiles add column is_active boolean not null default true;

-- Update the two helper functions everything already relies on — this is
-- the ONLY place deactivation logic needs to live. No RLS policy anywhere
-- else needs to change, since they all call one of these two functions.
create or replace function has_building_access(check_building_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from cem_building_assignments a
    join profiles p on p.id = a.cem_id
    where a.cem_id = auth.uid()
      and a.building_id = check_building_id
      and p.is_active
  );
$$;

create or replace function is_assigned_cem()
returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from profiles pr
    join cem_building_assignments a on a.cem_id = pr.id
    where pr.id = auth.uid() and pr.role = 'cem' and pr.is_active
  );
$$;

-- Admin-only toggle, same pattern as set_product_active — never a raw
-- profiles update from the client.
create or replace function set_cem_active(p_cem_id uuid, p_is_active boolean)
returns void language plpgsql security invoker as $$
begin
  if not is_admin() then
    raise exception 'Only Admin may activate/deactivate a CEM';
  end if;
  update profiles set is_active = p_is_active
    where id = p_cem_id and role = 'cem';
end; $$;
grant execute on function set_cem_active(uuid, boolean) to authenticated;

-- ---------- 2. Building name uniqueness ----------
alter table buildings add column name_normalized text
  generated always as (lower(trim(name))) stored;

create unique index buildings_name_normalized_key on buildings (name_normalized);