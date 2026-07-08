import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

interface LogConsumptionParams {
  productId: string
  buildingId: string
  floorId: string
  quantity: number
  reason: string
}

async function logConsumption(params: LogConsumptionParams): Promise<string> {
  const { data, error } = await supabase.rpc('log_consumption', {
    p_product_id: params.productId,
    p_building_id: params.buildingId,
    p_floor_id: params.floorId,
    p_quantity: params.quantity,
    p_reason: params.reason,
  })
  if (error) throw error
  return data as string
}

/** Atomic: ledger insert + stock decrement (see migration 0003). DB rejects over-consumption as the final guard. */
export function useLogConsumption() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logConsumption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cem', 'stock'] })
    },
  })
}
