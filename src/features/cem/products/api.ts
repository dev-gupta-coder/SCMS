import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { ProductRecord, ProductSearchResult } from './types'

const PRODUCT_FIELDS =
  'id, name, name_normalized, model, category, unit, vendor_name, current_price_per_unit, is_active, merged_into_product_id'

interface ProductJoinFields {
  id: string
  name: string
  name_normalized: string
  model: string | null
  category: string
  unit: string
  vendor_name: string | null
  current_price_per_unit: number
  is_active: boolean
  merged_into_product_id: string | null
}

function toProductRecord(link: { is_active: boolean; low_stock_threshold: number | null }, product: ProductJoinFields): ProductRecord {
  return {
    id: product.id,
    name: product.name,
    name_normalized: product.name_normalized,
    model: product.model,
    category: product.category,
    unit: product.unit,
    vendor_name: product.vendor_name,
    current_price_per_unit: Number(product.current_price_per_unit),
    is_active: link.is_active && product.is_active,
    low_stock_threshold: link.low_stock_threshold,
  }
}

interface BuildingProductRow {
  is_active: boolean
  low_stock_threshold: number | null
  product: ProductJoinFields
}

async function fetchProducts(buildingId: string): Promise<ProductRecord[]> {
  // Products are global (migration 0008) — building_id no longer lives on
  // `products`, so this building's catalog is everything linked via
  // building_products. merged_into_product_id is filtered here, not by
  // RLS: the read policy on `products` deliberately stopped excluding
  // merged rows (so ledger-history joins can still resolve them), which
  // makes "live only" a query-level concern from here on. building_products
  // links should never point at a merged-away row in practice (the merge
  // always repoints them to the canonical id), but this filter is the
  // actual enforcement, not an assumption.
  const { data, error } = await supabase
    .from('building_products')
    .select(`is_active, low_stock_threshold, product:products!inner(${PRODUCT_FIELDS})`)
    .eq('building_id', buildingId)
    .is('product.merged_into_product_id', null)

  if (error) throw error

  return (data as unknown as BuildingProductRow[])
    .map((row) => toProductRecord(row, row.product))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function useProducts(buildingId: string | undefined) {
  return useQuery({
    queryKey: ['cem', 'products', buildingId],
    queryFn: () => fetchProducts(buildingId!),
    enabled: !!buildingId,
  })
}

async function fetchProduct(buildingId: string, productId: string): Promise<ProductRecord> {
  const { data, error } = await supabase
    .from('building_products')
    .select(`is_active, low_stock_threshold, product:products!inner(${PRODUCT_FIELDS})`)
    .eq('building_id', buildingId)
    .eq('product_id', productId)
    .single()
  if (error) throw error

  const row = data as unknown as BuildingProductRow
  return toProductRecord(row, row.product)
}

/** Threshold and per-building is_active only make sense in the context of one building, so this now takes buildingId too. */
export function useProduct(buildingId: string | undefined, productId: string | undefined) {
  return useQuery({
    queryKey: ['cem', 'product', buildingId, productId],
    queryFn: () => fetchProduct(buildingId!, productId!),
    enabled: !!buildingId && !!productId,
  })
}

/** True for a unique_violation on the global name+model index (migration 0008) — the DB-level dedup hard block. */
export function isDuplicateNameError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === '23505'
}

/** PostgREST .or() filter syntax treats commas/parens specially — strip them so free-text search input can't break the filter. */
function sanitizeSearchTerm(input: string): string {
  return input.replace(/[,()]/g, ' ').trim()
}

async function searchProducts(buildingId: string, query: string): Promise<ProductSearchResult[]> {
  const term = sanitizeSearchTerm(query)
  if (term.length < 2) return []

  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, name_normalized, model, category, unit, vendor_name, current_price_per_unit, building_products!left(building_id)',
    )
    .is('merged_into_product_id', null)
    .or(`name.ilike.%${term}%,model.ilike.%${term}%`)
    .eq('building_products.building_id', buildingId)
    .order('name')
    .limit(8)
  if (error) throw error

  return (
    data as unknown as (Omit<ProductSearchResult, 'already_linked'> & {
      building_products: { building_id: string }[]
    })[]
  ).map(({ building_products, ...product }) => ({
    ...product,
    current_price_per_unit: Number(product.current_price_per_unit),
    already_linked: building_products.length > 0,
  }))
}

/** Search-as-you-type reuse lookup — global, live products only (PRD/CLAUDE.md Global Products). */
export function useProductSearch(buildingId: string | undefined, query: string) {
  const term = query.trim()
  return useQuery({
    queryKey: ['cem', 'product-search', buildingId, term.toLowerCase()],
    queryFn: () => searchProducts(buildingId!, term),
    enabled: !!buildingId && term.length >= 2,
    staleTime: 15_000,
  })
}

interface ProductFieldParams {
  buildingId: string
  name: string
  model: string | null
  category: string
  unit: string
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
    // Priority picker removed from the UI (CLAUDE.md UX Polish) — every
    // product now gets a fixed default; the column/constraint stay as-is.
    p_priority: 'Necessary',
    p_vendor_name: params.vendorName,
    p_price_per_unit: params.pricePerUnit,
    p_low_stock_threshold: params.lowStockThreshold,
  })
  if (error) throw error
  return data as string
}

function invalidateProductQueries(queryClient: ReturnType<typeof useQueryClient>, buildingId: string) {
  queryClient.invalidateQueries({ queryKey: ['cem', 'products', buildingId] })
  queryClient.invalidateQueries({ queryKey: ['cem', 'stock'] })
  queryClient.invalidateQueries({ queryKey: ['cem', 'delivery-products'] })
  queryClient.invalidateQueries({ queryKey: ['cem', 'product-search'] })
}

/** Atomic: global product insert + building_products link + a 0-stock inventory_stock row per existing floor (migration 0008/0005). */
export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createProduct,
    onSuccess: (_data, params) => invalidateProductQueries(queryClient, params.buildingId),
  })
}

interface LinkProductParams {
  buildingId: string
  productId: string
  lowStockThreshold: number | null
}

async function linkProductToBuilding(params: LinkProductParams): Promise<string> {
  const { data, error } = await supabase.rpc('link_product_to_building', {
    p_building_id: params.buildingId,
    p_product_id: params.productId,
    p_low_stock_threshold: params.lowStockThreshold,
  })
  if (error) throw error
  return data as string
}

/** Reuse path: attach an existing global product to this building instead of creating a near-duplicate (migration 0008). */
export function useLinkProductToBuilding() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: linkProductToBuilding,
    onSuccess: (_data, params) => invalidateProductQueries(queryClient, params.buildingId),
  })
}

interface UpdateProductParams extends ProductFieldParams {
  productId: string
}

async function updateProduct(params: UpdateProductParams): Promise<void> {
  const { error } = await supabase.rpc('update_product', {
    p_product_id: params.productId,
    p_building_id: params.buildingId,
    p_name: params.name,
    p_model: params.model,
    p_category: params.category,
    p_unit: params.unit,
    // Priority picker removed from the UI (CLAUDE.md UX Polish) — every
    // product now gets a fixed default; the column/constraint stay as-is.
    p_priority: 'Necessary',
    p_vendor_name: params.vendorName,
    p_price_per_unit: params.pricePerUnit,
    p_low_stock_threshold: params.lowStockThreshold,
  })
  if (error) throw error
}

/** Atomic: global fields on products + low_stock_threshold on building_products, in one transaction (migration 0010). */
export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (_data, params) => {
      invalidateProductQueries(queryClient, params.buildingId)
      queryClient.invalidateQueries({ queryKey: ['cem', 'product', params.buildingId, params.productId] })
    },
  })
}
