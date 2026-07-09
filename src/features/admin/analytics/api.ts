import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { DateRange } from '../dateRanges'

export interface DeliveryAnalyticsRow {
  total_price: number | null
  logged_at: string
  building_id: string
  product: { category: string }
}

async function fetchDeliveryRows(range: DateRange): Promise<DeliveryAnalyticsRow[]> {
  const { data, error } = await supabase
    .from('ledger_entries')
    .select('total_price, logged_at, building_id, product:products(category)')
    .eq('entry_type', 'delivery')
    .gte('logged_at', `${range.from}T00:00:00`)
    .lte('logged_at', `${range.to}T23:59:59`)
  if (error) throw error
  return data as unknown as DeliveryAnalyticsRow[]
}

/** Backs Spend by Category / Building / Time. keepPreviousData avoids a blank flash while a new range loads. */
export function useDeliveryAnalytics(range: DateRange) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'delivery', range],
    queryFn: () => fetchDeliveryRows(range),
    placeholderData: keepPreviousData,
  })
}

export interface ConsumptionAnalyticsRow {
  quantity: number
  logged_at: string
  product: { id: string; name: string; unit: string }
}

async function fetchConsumptionRows(range: DateRange): Promise<ConsumptionAnalyticsRow[]> {
  const { data, error } = await supabase
    .from('ledger_entries')
    .select('quantity, logged_at, product:products(id, name, unit)')
    .eq('entry_type', 'consumption')
    .gte('logged_at', `${range.from}T00:00:00`)
    .lte('logged_at', `${range.to}T23:59:59`)
  if (error) throw error
  return data as unknown as ConsumptionAnalyticsRow[]
}

/** Backs Top Consumed Products / Usage Trend. */
export function useConsumptionAnalytics(range: DateRange) {
  return useQuery({
    queryKey: ['admin', 'analytics', 'consumption', range],
    queryFn: () => fetchConsumptionRows(range),
    placeholderData: keepPreviousData,
  })
}
