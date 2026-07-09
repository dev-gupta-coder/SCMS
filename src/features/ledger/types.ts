export type LedgerEntryType = 'delivery' | 'consumption' | 'transfer'

export interface LedgerEntry {
  id: string
  entry_type: LedgerEntryType
  quantity: number
  price_per_unit: number | null
  total_price: number | null
  reason: string | null
  logged_at: string
  notes: string | null
  floor_id: string | null
  from_floor_id: string | null
  to_floor_id: string | null
  product: { id: string; name: string; unit: string }
}

export interface FloorLike {
  id: string
  name: string
  floor_type: 'warehouse' | 'floor'
}
