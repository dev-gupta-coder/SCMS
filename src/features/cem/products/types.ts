export interface ProductRecord {
  id: string
  building_id: string
  name: string
  name_normalized: string
  model: string | null
  category: string
  unit: string
  priority: string
  vendor_name: string | null
  current_price_per_unit: number
  low_stock_threshold: number | null
  is_active: boolean
}
