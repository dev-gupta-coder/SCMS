import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { ProductRecord } from './types'

const PRODUCT_COLUMNS =
  'id, building_id, name, name_normalized, model, category, unit, priority, vendor_name, current_price_per_unit, low_stock_threshold, is_active'

async function fetchProducts(buildingId: string): Promise<ProductRecord[]> {
  // Active and inactive both — the unique(building_id, name_normalized)
  // constraint doesn't care about is_active, so the dedup check (and the
  // CEM's own product list) needs the full picture.
  const { data, error } = await supabase.from('products').select(PRODUCT_COLUMNS).eq('building_id', buildingId).order('name')
  if (error) throw error
  return data
}

export function useProducts(buildingId: string | undefined) {
  return useQuery({
    queryKey: ['cem', 'products', buildingId],
    queryFn: () => fetchProducts(buildingId!),
    enabled: !!buildingId,
  })
}

async function fetchProduct(productId: string): Promise<ProductRecord> {
  const { data, error } = await supabase.from('products').select(PRODUCT_COLUMNS).eq('id', productId).single()
  if (error) throw error
  return data
}

export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: ['cem', 'product', productId],
    queryFn: () => fetchProduct(productId!),
    enabled: !!productId,
  })
}

/** True for a unique_violation on unique(building_id, name_normalized) — the DB-level dedup hard block. */
export function isDuplicateNameError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === '23505'
}

interface ProductFieldParams {
  buildingId: string
  name: string
  model: string | null
  category: string
  unit: string
  priority: string
  vendorName: string | null
  pricePerUnit: number
  lowStockThreshold: number | null
}

async function createProduct(params: ProductFieldParams): Promise<string> {
  const { data, error } = await supabase.rpc('create_product', {
    p_building_id: params.buildingId,
    p_name: params.name,
    p_model: params.model,
    p_category: params.category,
    p_unit: params.unit,
    p_priority: params.priority,
    p_vendor_name: params.vendorName,
    p_price_per_unit: params.pricePerUnit,
    p_low_stock_threshold: params.lowStockThreshold,
  })
  if (error) throw error
  return data as string
}

/** Atomic: product insert + a 0-stock inventory_stock row per existing floor (see migration 0005). */
export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ['cem', 'products', params.buildingId] })
      queryClient.invalidateQueries({ queryKey: ['cem', 'stock'] })
      queryClient.invalidateQueries({ queryKey: ['cem', 'delivery-products'] })
    },
  })
}

interface UpdateProductParams extends ProductFieldParams {
  productId: string
}

async function updateProduct(params: UpdateProductParams): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({
      name: params.name,
      model: params.model,
      category: params.category,
      unit: params.unit,
      priority: params.priority,
      vendor_name: params.vendorName,
      current_price_per_unit: params.pricePerUnit,
      low_stock_threshold: params.lowStockThreshold,
    })
    .eq('id', params.productId)
  if (error) throw error
}

/** Single-row update — no RPC needed, no other table is touched. */
export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: ['cem', 'products', params.buildingId] })
      queryClient.invalidateQueries({ queryKey: ['cem', 'product', params.productId] })
      queryClient.invalidateQueries({ queryKey: ['cem', 'stock'] })
      queryClient.invalidateQueries({ queryKey: ['cem', 'delivery-products'] })
    },
  })
}
