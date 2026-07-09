import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabaseClient'

export interface CatalogProduct {
  id: string
  name: string
  model: string | null
  category: string
  unit: string
  priority: string
  vendor_name: string | null
  current_price_per_unit: number
  low_stock_threshold: number | null
  is_active: boolean
  building: { id: string; name: string }
}

async function fetchCatalog(): Promise<CatalogProduct[]> {
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, model, category, unit, priority, vendor_name, current_price_per_unit, low_stock_threshold, is_active, building:buildings(id, name)',
    )
    .order('name')
  if (error) throw error
  return data as unknown as CatalogProduct[]
}

/** PRD 11, Admin screen 7 — read-only across all buildings; is_active toggle is the only write this screen makes. */
export function useProductCatalog() {
  return useQuery({ queryKey: ['admin', 'product-catalog'], queryFn: fetchCatalog })
}

interface ToggleParams {
  productId: string
  isActive: boolean
}

async function toggleProductActive(params: ToggleParams): Promise<void> {
  // Deliberately the only field ever sent from this screen — Admin can
  // deactivate/reactivate but never create or edit a product (PRD 4.2).
  const { error } = await supabase.from('products').update({ is_active: params.isActive }).eq('id', params.productId)
  if (error) throw error
}

export function useToggleProductActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleProductActive,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'product-catalog'] }),
  })
}
