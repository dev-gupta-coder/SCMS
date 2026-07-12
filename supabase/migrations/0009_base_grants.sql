-- ============================================================
-- SCMS — Canvas Workspace
-- Migration 0009: baseline CRUD grants for `authenticated`
-- ============================================================
-- Supabase's hosted platform sets a default privilege baseline (CRUD for
-- `authenticated`/`anon` on every table) at project creation, outside of
-- any user migration. This project's tables are created purely by our own
-- user migrations (running as the `postgres` role), whose local default
-- ACL does NOT include that baseline — so `authenticated` only ever had
-- REFERENCES/TRIGGER/TRUNCATE, and every real PostgREST request 403'd
-- with "permission denied for table ..." before RLS was even evaluated.
-- This never showed up against the hosted canvas-scms-2 project (the
-- platform already had the baseline in place there); a from-scratch
-- `supabase db reset --local` never did, so local dev has effectively
-- never been able to serve authenticated traffic end-to-end.
--
-- Deliberately NO `anon` grants here. This app has no unauthenticated or
-- public access anywhere — PRD: "Clients never log in," client-facing
-- access is explicitly out of scope, and every table query in the
-- codebase runs after supabase.auth.signInWithPassword() succeeds, under
-- the `authenticated` role, never `anon`. Granting anon SELECT would be a
-- behavioral no-op today (every RLS policy in this schema keys off
-- auth.uid(), which is null for an anon request, so every policy already
-- evaluates false regardless of table grants) — but there's no reason to
-- widen the grant surface for a role this app never legitimately uses.
--
-- RLS remains the real access control either way. These grants only clear
-- PostgREST's baseline permission check so RLS policies get evaluated at
-- all — they do not grant unconditional access to anything.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public
  to authenticated;

-- Future tables created by later migrations inherit the same baseline
-- automatically, so this doesn't need repeating in every new migration.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
