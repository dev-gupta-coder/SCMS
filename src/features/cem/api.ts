import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { Building, Floor, StockRow, StockRowWithFloor } from './types'

async function fetchMyBuildings(): Promise<Building[]> {
  // RLS scopes this to the CEM's assigned buildings automatically.
  const { data, error } = await supabase
    .from('buildings')
    .select('id, name, address, is_active')
    .eq('is_active', true)
    .order('name')
  if (error) throw error
  return data
}

export function useMyBuildings() {
  return useQuery({ queryKey: ['cem', 'buildings'], queryFn: fetchMyBuildings })
}

async function fetchFloors(buildingId: string): Promise<Floor[]> {
  const { data, error } = await supabase
    .from('floors')
    .select('id, building_id, name, floor_type')
    .eq('building_id', buildingId)
  if (error) throw error

  return data.slice().sort((a, b) => {
    if (a.floor_type !== b.floor_type) return a.floor_type === 'warehouse' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

export function useFloors(buildingId: string | undefined) {
  return useQuery({
    queryKey: ['cem', 'floors', buildingId],
    queryFn: () => fetchFloors(buildingId!),
    enabled: !!buildingId,
  })
}

async function fetchFloorStock(floorId: string): Promise<StockRow[]> {
  const { data, error } = await supabase
    .from('inventory_stock')
    .select('id, current_stock, product:products!inner(id, name, category, unit, priority, low_stock_threshold)')
    .eq('floor_id', floorId)
    .eq('product.is_active', true)
    .gt('current_stock', 0)
  if (error) throw error
  return data as unknown as StockRow[]
}

async function fetchAllFloorsStock(floorIds: string[]): Promise<StockRowWithFloor[]> {
  const { data, error } = await supabase
    .from('inventory_stock')
    .select(
      'id, current_stock, floor_id, product:products!inner(id, name, category, unit, priority, low_stock_threshold), floor:floors!inner(id, name, floor_type)',
    )
    .in('floor_id', floorIds)
    .eq('product.is_active', true)
    .gt('current_stock', 0)
  if (error) throw error
  return data as unknown as StockRowWithFloor[]
}

type LocationSelection = { type: 'floor'; floorId: string } | { type: 'all'; floorIds: string[] }

/** Products with stock > 0 at the selected location (or across all floors of the building). */
export function useLocationStock(selection: LocationSelection) {
  const queryKey =
    selection.type === 'floor'
      ? ['cem', 'stock', 'floor', selection.floorId]
      : ['cem', 'stock', 'all', selection.floorIds.slice().sort().join(',')]

  return useQuery({
    queryKey,
    queryFn: () =>
      selection.type === 'floor' ? fetchFloorStock(selection.floorId) : fetchAllFloorsStock(selection.floorIds),
    enabled: selection.type === 'floor' ? !!selection.floorId : selection.floorIds.length > 0,
  })
}
