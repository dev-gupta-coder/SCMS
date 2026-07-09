export interface ReportRow {
  logged_at: string
  quantity: number
  price_per_unit: number | null
  total_price: number | null
  building_id: string
  product: { id: string; name: string; unit: string; category: string }
}
