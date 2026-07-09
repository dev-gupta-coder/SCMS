import type { FloorType } from '../types'

export interface AlertRecord {
  id: string
  created_at: string
  product: { id: string; name: string; unit: string }
  floor: { id: string; name: string; floor_type: FloorType }
}
