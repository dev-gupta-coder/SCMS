import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

export interface CatalogProduct {
  id: string
  name: string
  model: string | null
  category: string
  unit: string
  priority: string
  vendor_name: string | null
  current_price_per_unit: number
  is_active: boolean
  /** Every building this global product is currently linked to (building_products) — display detail only, not "the" building. */
  buildings: { id: string; name: string }[]
}

interface CatalogRow {
  id: string
  name: string
  model: string | null
  category: string
  unit: string
  priority: string
  vendor_name: string | null
  current_price_per_unit: number
  is_active: boolean
  building_products: { building: { id: string; name: string } }[]
}

async function fetchCatalog(): Promise<CatalogProduct[]> {
  // Products are global (migration 0008) — no single owning building.
  // merged_into_product_id is filtered here: merged rows stay in `products`
  // forever but are excluded from every live view (CLAUDE.md Global
  // Products), and Admin's read policy doesn't filter them out on its own.
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, model, category, unit, priority, vendor_name, current_price_per_unit, is_active, building_products(building:buildings(id, name))',
    )
    .is('merged_into_product_id', null)
    .order('name')
  if (error) throw error

  return (data as unknown as CatalogRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    model: row.model,
    category: row.category,
    unit: row.unit,
    priority: row.priority,
    vendor_name: row.vendor_name,
    current_price_per_unit: Number(row.current_price_per_unit),
    is_active: row.is_active,
    buildings: row.building_products.map((bp) => bp.building).sort((a, b) => a.name.localeCompare(b.name)),
  }))
}

/** PRD 11, Admin screen 7 — read-only across all buildings; is_active toggle is the only write this screen makes. */
export function useProductCatalog() {
  return useQuery({ queryKey: ['admin', 'product-catalog'], queryFn: fetchCatalog })
}

interface ToggleParams {
  productId: string
  isActive: boolean
}

async function toggleProductActive(params: ToggleParams): Promise<void> {
  // Admin's only allowed mutation on products (CLAUDE.md Global Products) —
  // a global kill switch via RPC, never a direct field edit. The RPC
  // itself re-checks is_admin() server-side, on top of RLS.
  const { error } = await supabase.rpc('set_product_active', {
    p_product_id: params.productId,
    p_is_active: params.isActive,
  })
  if (error) throw error
}

export function useToggleProductActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleProductActive,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'product-catalog'] }),
  })
}

export interface ProductOption {
  id: string
  name: string
  category: string
}

async function fetchAllLiveProducts(): Promise<ProductOption[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, category')
    .is('merged_into_product_id', null)
    .order('name')
  if (error) throw error
  return data
}

/**
 * Lightweight product list for filter dropdowns (Ledger History, Reports).
 * Global, not scoped to any building — a product can legitimately have
 * ledger entries across many buildings now (Global Products, CLAUDE.md),
 * so there's no single "the building" to join or filter by here, unlike
 * useProductCatalog above (which does the heavier building_products join
 * for the Product Catalog screen's own building-linkage display).
 */
export function useAllLiveProducts() {
  return useQuery({ queryKey: ['admin', 'all-live-products'], queryFn: fetchAllLiveProducts })
}
