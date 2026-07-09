import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { DateRange } from '../dateRanges'
import type { ReportRow } from './types'

export interface ReportFilters {
  dateRange: DateRange
  buildingId?: string
  category?: string
  productId?: string
}

async function fetchReportRows(filters: ReportFilters): Promise<ReportRow[]> {
  let query = supabase
    .from('ledger_entries')
    .select(
      'logged_at, quantity, price_per_unit, total_price, building_id, product:products!inner(id, name, unit, category)',
    )
    .eq('entry_type', 'delivery')
    .gte('logged_at', `${filters.dateRange.from}T00:00:00`)
    .lte('logged_at', `${filters.dateRange.to}T23:59:59`)
    .order('logged_at', { ascending: true })

  if (filters.buildingId) query = query.eq('building_id', filters.buildingId)
  if (filters.productId) query = query.eq('product_id', filters.productId)
  if (filters.category) query = query.eq('product.category', filters.category)

  const { data, error } = await query
  if (error) throw error
  return data as unknown as ReportRow[]
}

/** PRD 13 — Purchase/Delivery history only, filterable by date range, building, category, product. */
export function useReportRows(filters: ReportFilters) {
  return useQuery({
    queryKey: ['admin', 'report', filters],
    queryFn: () => fetchReportRows(filters),
  })
}
