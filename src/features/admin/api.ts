import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import { getStockStatus } from '@/lib/stockStatus'
import type { DateRange } from './dateRanges'
import type { AdminAlert, AdminBuilding, StockHealthCounts } from './types'

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

async function fetchStockHealth(scope: LocationScope): Promise<StockHealthRow[]> {
  let query = supabase
    .from('inventory_stock')
    .select(
      'current_stock, floor:floors!inner(building_id, floor_type), product:products!inner(low_stock_threshold, is_active)',
    )
    .eq('product.is_active', true)

  if (scope === 'warehouse') {
    query = query.eq('floor.floor_type', 'warehouse')
  }

  const { data, error } = await query
  if (error) throw error
  return data as unknown as StockHealthRow[]
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
