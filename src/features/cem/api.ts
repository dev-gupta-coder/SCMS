import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { Building, Floor, ProductInfo, StockRow, StockRowWithFloor } from './types'

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

interface RawProduct {
  id: string
  name: string
  category: string
  unit: string
  is_active: boolean
}

interface BuildingLink {
  product_id: string
  low_stock_threshold: number | null
}

/**
 * low_stock_threshold and the per-building show/hide flag live on
 * building_products now, not products (migration 0008) — products no
 * longer carries building_id at all, so there's no single query that can
 * join both in one shot without a per-row-varying building_id (see the
 * audit for fetchStockHealth, which genuinely can't). Here buildingId is
 * one fixed value the whole way down, so it's just two scoped queries
 * merged client-side by product_id.
 */
async function fetchBuildingLinks(buildingId: string): Promise<Map<string, BuildingLink>> {
  const { data, error } = await supabase
    .from('building_products')
    .select('product_id, low_stock_threshold')
    .eq('building_id', buildingId)
    .eq('is_active', true)
  if (error) throw error
  return new Map((data ?? []).map((link) => [link.product_id, link]))
}

function toProductInfo(product: RawProduct, links: Map<string, BuildingLink>): ProductInfo | null {
  const link = links.get(product.id)
  // No active link to this building — hidden from this building's view,
  // same as the old per-building is_active=false (building_products'
  // "that building's own show/hide", CLAUDE.md Global Products).
  if (!link) return null
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    unit: product.unit,
    low_stock_threshold: link.low_stock_threshold,
  }
}

interface RawStockRow {
  id: string
  current_stock: number
  product: RawProduct
}

async function fetchFloorStock(buildingId: string, floorId: string): Promise<StockRow[]> {
  const [{ data, error }, links] = await Promise.all([
    supabase
      .from('inventory_stock')
      .select('id, current_stock, product:products!inner(id, name, category, unit, is_active)')
      .eq('floor_id', floorId)
      .eq('product.is_active', true)
      .gt('current_stock', 0),
    fetchBuildingLinks(buildingId),
  ])
  if (error) throw error

  return (data as unknown as RawStockRow[]).flatMap((row) => {
    const product = toProductInfo(row.product, links)
    return product ? [{ id: row.id, current_stock: row.current_stock, product }] : []
  })
}

interface RawStockRowWithFloor extends RawStockRow {
  floor_id: string
  floor: { id: string; name: string; floor_type: 'warehouse' | 'floor' }
}

async function fetchAllFloorsStock(buildingId: string, floorIds: string[]): Promise<StockRowWithFloor[]> {
  const [{ data, error }, links] = await Promise.all([
    supabase
      .from('inventory_stock')
      .select(
        'id, current_stock, floor_id, product:products!inner(id, name, category, unit, is_active), floor:floors!inner(id, name, floor_type)',
      )
      .in('floor_id', floorIds)
      .eq('product.is_active', true)
      .gt('current_stock', 0),
    fetchBuildingLinks(buildingId),
  ])
  if (error) throw error

  return (data as unknown as RawStockRowWithFloor[]).flatMap((row) => {
    const product = toProductInfo(row.product, links)
    return product ? [{ id: row.id, current_stock: row.current_stock, floor_id: row.floor_id, floor: row.floor, product }] : []
  })
}

type LocationSelection =
  | { type: 'floor'; buildingId: string; floorId: string }
  | { type: 'all'; buildingId: string; floorIds: string[] }

/** Products with stock > 0 at the selected location (or across all floors of the building). */
export function useLocationStock(selection: LocationSelection) {
  const queryKey =
    selection.type === 'floor'
      ? ['cem', 'stock', 'floor', selection.buildingId, selection.floorId]
      : ['cem', 'stock', 'all', selection.buildingId, selection.floorIds.slice().sort().join(',')]

  return useQuery({
    queryKey,
    queryFn: () =>
      selection.type === 'floor'
        ? fetchFloorStock(selection.buildingId, selection.floorId)
        : fetchAllFloorsStock(selection.buildingId, selection.floorIds),
    enabled: selection.type === 'floor' ? !!selection.floorId : selection.floorIds.length > 0,
  })
}
