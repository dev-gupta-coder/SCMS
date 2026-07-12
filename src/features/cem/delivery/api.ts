import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { DeliveryProduct } from './types'

interface ProductWithWarehouseStockRow {
  id: string
  name: string
  category: string
  unit: string
  current_price_per_unit: number
  inventory_stock: { current_stock: number }[]
}

async function fetchWarehouseProducts(buildingId: string, warehouseFloorId: string): Promise<DeliveryProduct[]> {
  // building_products and inventory_stock are both direct children of
  // products (real FKs), so this stays a single query — unlike the CEM
  // checklist read paths, there's no per-row-varying building to
  // correlate against here, just two sibling filters on one fixed
  // buildingId/floorId. is_active is checked at both levels: the global
  // kill switch (products.is_active) and this building's own show/hide
  // (building_products.is_active) — migration 0008.
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, category, unit, current_price_per_unit, building_products!inner(is_active, building_id), inventory_stock!inner(current_stock, floor_id)',
    )
    .eq('is_active', true)
    .eq('building_products.building_id', buildingId)
    .eq('building_products.is_active', true)
    .eq('inventory_stock.floor_id', warehouseFloorId)
    .order('name')
  if (error) throw error

  return (data as unknown as ProductWithWarehouseStockRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    unit: row.unit,
    current_price_per_unit: Number(row.current_price_per_unit),
    current_stock: Number(row.inventory_stock[0]?.current_stock ?? 0),
  }))
}

/** Every active product in the building, with its current warehouse stock (may be 0 for a never-delivered product). */
export function useWarehouseProductsForDelivery(buildingId: string | undefined, warehouseFloorId: string | undefined) {
  return useQuery({
    queryKey: ['cem', 'delivery-products', buildingId, warehouseFloorId],
    queryFn: () => fetchWarehouseProducts(buildingId!, warehouseFloorId!),
    enabled: !!buildingId && !!warehouseFloorId,
  })
}

interface LogDeliveryParams {
  productId: string
  buildingId: string
  floorId: string
  quantity: number
  pricePerUnit: number
}

async function logDelivery(params: LogDeliveryParams): Promise<string> {
  const { data, error } = await supabase.rpc('log_delivery', {
    p_product_id: params.productId,
    p_building_id: params.buildingId,
    p_floor_id: params.floorId,
    p_quantity: params.quantity,
    p_price_per_unit: params.pricePerUnit,
  })
  if (error) throw error
  return data as string
}

/** Atomic: ledger insert + live price update + warehouse stock increment (see migration 0002). */
export function useLogDelivery() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cem', 'stock'] })
      queryClient.invalidateQueries({ queryKey: ['cem', 'delivery-products'] })
    },
  })
}
