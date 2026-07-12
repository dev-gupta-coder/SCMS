export interface ProductRecord {
  id: string
  name: string
  name_normalized: string
  model: string | null
  category: string
  unit: string
  vendor_name: string | null
  current_price_per_unit: number
  /** Global admin kill switch (products.is_active) AND this building's own show/hide (building_products.is_active) — false if either is off. */
  is_active: boolean
  /** Per-building only — lives on building_products, not products (migration 0008). */
  low_stock_threshold: number | null
}

/** A live (non-merged) global product match from the search-as-you-type reuse lookup. */
export interface ProductSearchResult {
  id: string
  name: string
  name_normalized: string
  model: string | null
  category: string
  unit: string
  vendor_name: string | null
  current_price_per_unit: number
  /** True if this product is already linked to the building the CEM is searching from. */
  already_linked: boolean
}
