import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { LedgerEntryType } from '@/features/ledger/types'
import type { DateRange } from '../dateRanges'
import type { AdminLedgerEntry } from './types'

export interface LedgerHistoryFilters {
  dateRange: DateRange
  productId?: string
  buildingId?: string
  floorId?: string
  cemId?: string
}

async function fetchLedgerHistory(
  entryType: LedgerEntryType,
  filters: LedgerHistoryFilters,
): Promise<AdminLedgerEntry[]> {
  let query = supabase
    .from('ledger_entries')
    .select(
      'id, entry_type, quantity, price_per_unit, total_price, reason, logged_at, notes, building_id, floor_id, from_floor_id, to_floor_id, product:products(id, name, model, unit, vendor_name), logged_by:profiles(id, full_name)',
    )
    .eq('entry_type', entryType)
    .gte('logged_at', `${filters.dateRange.from}T00:00:00`)
    .lte('logged_at', `${filters.dateRange.to}T23:59:59`)
    .order('logged_at', { ascending: false })
    .limit(500)

  if (filters.productId) query = query.eq('product_id', filters.productId)
  if (filters.buildingId) query = query.eq('building_id', filters.buildingId)
  if (filters.cemId) query = query.eq('logged_by', filters.cemId)

  // Transfer has no single floor_id — "involves this floor" means as source or destination.
  if (filters.floorId) {
    query =
      entryType === 'transfer'
        ? query.or(`from_floor_id.eq.${filters.floorId},to_floor_id.eq.${filters.floorId}`)
        : query.eq('floor_id', filters.floorId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as unknown as AdminLedgerEntry[]
}

/** PRD 11, Admin screen 8 — filterable by date range, product, building, floor, and CEM across all three tabs. */
export function useLedgerHistory(entryType: LedgerEntryType, filters: LedgerHistoryFilters) {
  return useQuery({
    queryKey: ['admin', 'ledger-history', entryType, filters],
    queryFn: () => fetchLedgerHistory(entryType, filters),
  })
}
