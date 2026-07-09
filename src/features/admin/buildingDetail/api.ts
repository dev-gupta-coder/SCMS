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

async function fetchBuildingStock(buildingId: string): Promise<BuildingStockRow[]> {
  // Unlike the CEM checklist, this includes every row regardless of stock
  // level or product.is_active — Admin needs the complete picture, not the
  // daily-workflow simplification.
  const { data, error } = await supabase
    .from('inventory_stock')
    .select(
      'id, current_stock, floor_id, floor:floors!inner(id, name, floor_type, building_id), product:products!inner(id, name, unit, category, low_stock_threshold, is_active)',
    )
    .eq('floor.building_id', buildingId)
  if (error) throw error
  return data as unknown as BuildingStockRow[]
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
