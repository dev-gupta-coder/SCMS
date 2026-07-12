import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { LedgerEntry } from '@/features/ledger/types'

export interface BuildingStockRow {
  id: string
  current_stock: number
  floor_id: string
  floor: { id: string; name: string; floor_type: 'warehouse' | 'floor' }
  product: {
    id: string
    name: string
    unit: string
    category: string
    low_stock_threshold: number | null
    is_active: boolean
  }
}

async function fetchBuilding(buildingId: string) {
  const { data, error } = await supabase
    .from('buildings')
    .select('id, name, address, is_active')
    .eq('id', buildingId)
    .single()
  if (error) throw error
  return data
}

export function useBuilding(buildingId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'building', buildingId],
    queryFn: () => fetchBuilding(buildingId!),
    enabled: !!buildingId,
  })
}

interface RawBuildingStockRow {
  id: string
  current_stock: number
  floor_id: string
  floor: { id: string; name: string; floor_type: 'warehouse' | 'floor' }
  product: { id: string; name: string; unit: string; category: string; is_active: boolean }
}

async function fetchBuildingStock(buildingId: string): Promise<BuildingStockRow[]> {
  // Unlike the CEM checklist, this includes every row regardless of stock
  // level or product.is_active — Admin needs the complete picture, not the
  // daily-workflow simplification. low_stock_threshold and this
  // building's own show/hide now live on building_products (migration
  // 0008), fetched separately and merged by product_id since buildingId
  // is fixed here (unlike fetchStockHealth, which spans every building).
  const [{ data, error }, { data: links, error: linksError }] = await Promise.all([
    supabase
      .from('inventory_stock')
      .select(
        'id, current_stock, floor_id, floor:floors!inner(id, name, floor_type, building_id), product:products!inner(id, name, unit, category, is_active)',
      )
      .eq('floor.building_id', buildingId),
    supabase.from('building_products').select('product_id, low_stock_threshold, is_active').eq('building_id', buildingId),
  ])
  if (error) throw error
  if (linksError) throw linksError

  const linkByProduct = new Map((links ?? []).map((link) => [link.product_id, link]))

  return (data as unknown as RawBuildingStockRow[]).map((row) => {
    const link = linkByProduct.get(row.product.id)
    return {
      id: row.id,
      current_stock: row.current_stock,
      floor_id: row.floor_id,
      floor: row.floor,
      product: {
        id: row.product.id,
        name: row.product.name,
        unit: row.product.unit,
        category: row.product.category,
        low_stock_threshold: link?.low_stock_threshold ?? null,
        is_active: (link?.is_active ?? false) && row.product.is_active,
      },
    }
  })
}

export function useBuildingStock(buildingId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'building-stock', buildingId],
    queryFn: () => fetchBuildingStock(buildingId!),
    enabled: !!buildingId,
  })
}

async function fetchRecentLedger(buildingId: string): Promise<LedgerEntry[]> {
  const { data, error } = await supabase
    .from('ledger_entries')
    .select(
      'id, entry_type, quantity, price_per_unit, total_price, reason, logged_at, notes, floor_id, from_floor_id, to_floor_id, product:products(id, name, unit)',
    )
    .eq('building_id', buildingId)
    .order('logged_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data as unknown as LedgerEntry[]
}

export function useRecentLedger(buildingId: string | undefined) {
  return useQuery({
    queryKey: ['admin', 'recent-ledger', buildingId],
    queryFn: () => fetchRecentLedger(buildingId!),
    enabled: !!buildingId,
  })
}
