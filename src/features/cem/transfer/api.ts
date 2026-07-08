import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

interface LogTransferParams {
  productId: string
  buildingId: string
  fromFloorId: string
  toFloorId: string
  quantity: number
}

async function logTransfer(params: LogTransferParams): Promise<string> {
  const { data, error } = await supabase.rpc('log_transfer', {
    p_product_id: params.productId,
    p_building_id: params.buildingId,
    p_from_floor_id: params.fromFloorId,
    p_to_floor_id: params.toFloorId,
    p_quantity: params.quantity,
  })
  if (error) throw error
  return data as string
}

/** Atomic: ledger insert + source decrement + destination increment (see migration 0004). */
export function useLogTransfer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cem', 'stock'] })
    },
  })
}
