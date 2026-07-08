-- ============================================================
-- SCMS Seed Data — for local/dev testing only
-- Run AFTER creating at least one admin + one CEM user via Supabase Auth
-- (auth.users rows must exist first — see docs/CLAUDE.md Step 2)
-- ============================================================

-- Sample building
insert into buildings (id, name, address) values
  ('11111111-1111-1111-1111-111111111111', 'Canvas Koramangala', 'Koramangala, Bengaluru');

-- Auto-create warehouse floor (normally done by app logic/trigger; seeded manually here)
insert into floors (building_id, name, floor_type) values
  ('11111111-1111-1111-1111-111111111111', 'Warehouse', 'warehouse');

-- Sample non-warehouse floors (Admin-created)
insert into floors (building_id, name, floor_type) values
  ('11111111-1111-1111-1111-111111111111', 'Floor 1', 'floor'),
  ('11111111-1111-1111-1111-111111111111', 'Floor 2', 'floor');

-- NOTE: profiles, cem_building_assignments, products, and ledger_entries
-- depend on real auth.users IDs created through Supabase Auth (or the
-- CEM-creation Edge Function). Insert those manually after your first
-- admin/CEM sign-up, using their actual auth.users.id values, e.g.:
--
-- insert into profiles (id, full_name, role, personal_email) values
--   ('<admin-auth-uid>', 'Admin Name', 'admin', null),
--   ('<cem-auth-uid>', 'CEM Name', 'cem', 'cemname@gmail.com');
--
-- insert into cem_building_assignments (cem_id, building_id) values
--   ('<cem-auth-uid>', '11111111-1111-1111-1111-111111111111');
