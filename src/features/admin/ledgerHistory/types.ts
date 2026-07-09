import type { LedgerEntryType } from '@/features/ledger/types'

export interface AdminLedgerEntry {
  id: string
  entry_type: LedgerEntryType
  quantity: number
  price_per_unit: number | null
  total_price: number | null
  reason: string | null
  logged_at: string
  notes: string | null
  building_id: string
  floor_id: string | null
  from_floor_id: string | null
  to_floor_id: string | null
  product: { id: string; name: string; model: string | null; unit: string; vendor_name: string | null }
  logged_by: { id: string; full_name: string }
}
