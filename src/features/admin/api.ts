import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { getStockStatus } from '@/lib/stockStatus'
import type { DateRange } from './dateRanges'
import type { AdminAlert, AdminBuilding, FloorType, StockHealthCounts } from './types'

async function fetchAllBuildings(): Promise<AdminBuilding[]> {
  const { data, error } = await supabase.from('buildings').select('id, name').eq('is_active', true).order('name')
  if (error) throw error
  return data
}

/** Admin has blanket read access (is_admin() RLS) — every active building, not just assigned ones. */
export function useAllBuildings() {
  return useQuery({ queryKey: ['admin', 'buildings'], queryFn: fetchAllBuildings })
}

export type LocationScope = 'all' | 'warehouse'

interface StockHealthRow {
  current_stock: number
  floor: { building_id: string; floor_type: 'warehouse' | 'floor' }
  product: { low_stock_threshold: number | null }
}

interface RawStockHealthRow {
  current_stock: number
  floor: { building_id: string; floor_type: 'warehouse' | 'floor' }
  product: { id: string; is_active: boolean }
}

/**
 * low_stock_threshold and the per-building show/hide flag live on
 * building_products now (migration 0008). This rolls up rows across
 * every building at once, so — unlike a screen scoped to one fixed
 * building — the right building_products row varies per inventory_stock
 * row (it must match that row's OWN floor's building, not a single
 * constant). PostgREST embed filters only compare against a fixed value,
 * so that per-row correlation can't be expressed in one query; this
 * fetches both and merges by "buildingId:productId" client-side instead.
 */
async function fetchStockHealth(scope: LocationScope): Promise<StockHealthRow[]> {
  let query = supabase
    .from('inventory_stock')
    .select('current_stock, floor:floors!inner(building_id, floor_type), product:products!inner(id, is_active)')
    .eq('product.is_active', true)

  if (scope === 'warehouse') {
    query = query.eq('floor.floor_type', 'warehouse')
  }

  const { data, error } = await query
  if (error) throw error
  const rows = data as unknown as RawStockHealthRow[]

  const buildingIds = Array.from(new Set(rows.map((row) => row.floor.building_id)))
  const { data: links, error: linksError } = await supabase
    .from('building_products')
    .select('building_id, product_id, low_stock_threshold, is_active')
    .in('building_id', buildingIds)
  if (linksError) throw linksError

  const activeLinks = (links ?? []).filter((link) => link.is_active)
  const thresholdByLink = new Map(activeLinks.map((link) => [`${link.building_id}:${link.product_id}`, link.low_stock_threshold]))
  const activeLinkKeys = new Set(thresholdByLink.keys())

  return rows
    .filter((row) => activeLinkKeys.has(`${row.floor.building_id}:${row.product.id}`))
    .map((row) => ({
      current_stock: row.current_stock,
      floor: row.floor,
      product: { low_stock_threshold: thresholdByLink.get(`${row.floor.building_id}:${row.product.id}`) ?? null },
    }))
}

interface StockHealthSummary {
  overall: StockHealthCounts
  perBuilding: Record<string, StockHealthCounts>
}

const EMPTY_COUNTS: StockHealthCounts = { healthy: 0, low: 0, noThreshold: 0 }

/**
 * Rolls up every inventory_stock row (not just >0 ones — unlike the CEM
 * checklist, a 0-stock item with a threshold set is exactly the kind of
 * thing Admin needs to see flagged, not hidden) into healthy/low/no-threshold
 * counts, overall and per building.
 */
export function useStockHealth(scope: LocationScope) {
  return useQuery({
    queryKey: ['admin', 'stock-health', scope],
    queryFn: async (): Promise<StockHealthSummary> => {
      const rows = await fetchStockHealth(scope)
      const overall: StockHealthCounts = { ...EMPTY_COUNTS }
      const perBuilding: Record<string, StockHealthCounts> = {}

      for (const row of rows) {
        const status = getStockStatus(row.current_stock, row.product.low_stock_threshold)
        const bucket = status === 'healthy' ? 'healthy' : status === 'low' ? 'low' : 'noThreshold'
        overall[bucket] += 1

        const buildingId = row.floor.building_id
        perBuilding[buildingId] ??= { ...EMPTY_COUNTS }
        perBuilding[buildingId][bucket] += 1
      }

      return { overall, perBuilding }
    },
  })
}

async function fetchAllActiveAlerts(): Promise<AdminAlert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('id, created_at, product:products(id, name, unit), building:buildings(id, name), floor:floors(id, name, floor_type)')
    .eq('is_resolved', false)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as AdminAlert[]
}

/** Across all buildings — same caveat as the CEM version: empty until the step-16 Edge Function populates alerts. */
export function useAllActiveAlerts() {
  return useQuery({ queryKey: ['admin', 'alerts'], queryFn: fetchAllActiveAlerts })
}

export interface AdminAlertGroupFloor {
  alertId: string
  id: string
  name: string
  floor_type: FloorType
  created_at: string
}

export interface AdminAlertGroup {
  key: string
  product: { id: string; name: string; unit: string }
  building: { id: string; name: string }
  floors: AdminAlertGroupFloor[]
  latestCreatedAt: string
}

/**
 * PRD 12 — alerts are per (product, building, floor); this is display-only
 * grouping, no schema or query change (alerts already carries product_id
 * and building_id). One row per product-per-building, with every floor
 * that's currently low on it available for the expanded view.
 */
export function groupAlertsByProductAndBuilding(alerts: AdminAlert[]): AdminAlertGroup[] {
  const groups = new Map<string, AdminAlertGroup>()

  for (const alert of alerts) {
    const key = `${alert.product.id}:${alert.building.id}`
    let group = groups.get(key)
    if (!group) {
      group = { key, product: alert.product, building: alert.building, floors: [], latestCreatedAt: alert.created_at }
      groups.set(key, group)
    }
    group.floors.push({
      alertId: alert.id,
      id: alert.floor.id,
      name: alert.floor.name,
      floor_type: alert.floor.floor_type,
      created_at: alert.created_at,
    })
    if (alert.created_at > group.latestCreatedAt) group.latestCreatedAt = alert.created_at
  }

  return Array.from(groups.values()).sort((a, b) => b.latestCreatedAt.localeCompare(a.latestCreatedAt))
}

async function fetchSpend(range: DateRange): Promise<number> {
  const { data, error } = await supabase
    .from('ledger_entries')
    .select('total_price')
    .eq('entry_type', 'delivery')
    .gte('logged_at', `${range.from}T00:00:00`)
    .lte('logged_at', `${range.to}T23:59:59`)
  if (error) throw error
  return (data ?? []).reduce((sum, row) => sum + Number(row.total_price ?? 0), 0)
}

/** Delivery total_price only — the one entry type that ever carries a price (PRD out-of-scope note on transfer/consumption pricing). */
export function useSpend(range: DateRange) {
  return useQuery({
    queryKey: ['admin', 'spend', range.from, range.to],
    queryFn: () => fetchSpend(range),
    enabled: range.from !== '' && range.to !== '',
  })
}
