import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'
import type { AlertRecord } from './types'

async function fetchActiveAlerts(buildingId: string): Promise<AlertRecord[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('id, created_at, product:products(id, name, unit), floor:floors(id, name, floor_type)')
    .eq('building_id', buildingId)
    .eq('is_resolved', false)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as unknown as AlertRecord[]
}

/**
 * PRD 11, CEM App screen 11 — active low-stock alerts. Alerts are only ever
 * system-generated (build order step 16's Edge Function on ledger insert),
 * so this reads an empty list until that trigger exists — expected for now.
 */
export function useActiveAlerts(buildingId: string | undefined) {
  return useQuery({
    queryKey: ['cem', 'alerts', buildingId],
    queryFn: () => fetchActiveAlerts(buildingId!),
    enabled: !!buildingId,
  })
}
