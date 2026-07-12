-- ============================================================
-- SCMS — Canvas Workspace
-- Migration 0010: update_product RPC
-- ============================================================
-- Editing a product now touches two tables (global fields on `products`,
-- `low_stock_threshold` on `building_products`) since migration 0008 split
-- them apart. Two separate client-side UPDATEs would risk a partial write
-- if the second one failed after the first succeeded — and since global
-- fields now affect every building a product is linked to, not just one,
-- that partial-failure window matters more here than it used to. Bundled
-- into one RPC for the same reason create_product/log_delivery/etc.
-- already avoid partial writes. SECURITY INVOKER: both UPDATEs run under
-- the calling CEM's own RLS (products' "Assigned CEMs edit products",
-- building_products' "CEM updates links in assigned buildings") — this
-- function adds no new access.

create or replace function update_product(
  p_product_id uuid,
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
returns void
language plpgsql
security invoker
as $$
begin
  update products
  set name = p_name,
      model = p_model,
      category = p_category,
      unit = p_unit,
      priority = p_priority,
      vendor_name = p_vendor_name,
      current_price_per_unit = p_price_per_unit
  where id = p_product_id;

  update building_products
  set low_stock_threshold = p_low_stock_threshold
  where building_id = p_building_id and product_id = p_product_id;
end;
$$;

grant execute on function update_product(uuid, uuid, text, text, text, text, text, text, numeric, numeric) to authenticated;
