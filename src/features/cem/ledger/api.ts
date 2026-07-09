import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { LedgerEntry } from '@/features/ledger/types'

export interface LedgerFilters {
  productId?: string
  fromDate?: string
  toDate?: string
}

async function fetchLedgerEntries(buildingId: string, filters: LedgerFilters): Promise<LedgerEntry[]> {
  let query = supabase
    .from('ledger_entries')
    .select(
      'id, entry_type, quantity, price_per_unit, total_price, reason, logged_at, notes, floor_id, from_floor_id, to_floor_id, product:products(id, name, unit)',
    )
    .eq('building_id', buildingId)
    .order('logged_at', { ascending: false })
    .limit(200)

  if (filters.productId) query = query.eq('product_id', filters.productId)
  if (filters.fromDate) query = query.gte('logged_at', `${filters.fromDate}T00:00:00`)
  if (filters.toDate) query = query.lte('logged_at', `${filters.toDate}T23:59:59`)

  const { data, error } = await query
  if (error) throw error
  return data as unknown as LedgerEntry[]
}

/** PRD 11, CEM App screen 10 — scrollable, filterable by product and date range. */
export function useLedgerEntries(buildingId: string | undefined, filters: LedgerFilters) {
  return useQuery({
    queryKey: ['cem', 'ledger', buildingId, filters],
    queryFn: () => fetchLedgerEntries(buildingId!, filters),
    enabled: !!buildingId,
  })
}
