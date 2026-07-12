-- ============================================================
-- SCMS — Canvas Workspace
-- Migration 0012: drop stale create_floor(uuid, text) overload
-- ============================================================
-- Migration 0006 defined create_floor(p_building_id uuid, p_name text).
-- Migration 0008 changed its signature to (uuid, text, text) via
-- `create or replace function` — but a different argument list makes
-- Postgres create a SEPARATE overload, not a replacement, so the old
-- 2-arg version was silently left behind. Its body still references
-- products.building_id, a column 0008 dropped from the same migration,
-- so calling it errors outright. Worse: the app's create_floor RPC call
-- only ever sends {p_building_id, p_name}, which PostgREST resolves to
-- this exact stale overload instead of the intended 3-arg one — so
-- every real "Add Floor" call has been broken since 0008 shipped.
-- See CLAUDE.md's "RPC overload rule" for the standing rule this
-- migration exists to satisfy going forward.

drop function if exists create_floor(uuid, text);
