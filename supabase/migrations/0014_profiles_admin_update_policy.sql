-- ============================================================
-- Migration 0014: missing RLS UPDATE policy on profiles.
-- ============================================================
-- set_cem_active() (migration 0013) is `security invoker` by design — same
-- pattern as set_product_active() (migration 0008) — so its `update
-- profiles set is_active = ...` runs under the calling admin's own RLS
-- policies, not as a superuser. 0008 paired set_product_active with
-- `create policy "Admin toggles product active state" on products for
-- update using (is_admin());`, but 0013 never added the matching policy on
-- profiles. Since profiles has RLS enabled with zero UPDATE policies
-- anywhere in the migration history, the admin's own UPDATE silently
-- matched 0 rows — no error, just a no-op — so set_cem_active has never
-- actually flipped is_active on local OR production since 0013 shipped.
-- ============================================================

create policy "Admin toggles CEM active state"
  on profiles for update using (is_admin());
