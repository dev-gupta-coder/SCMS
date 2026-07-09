export interface AdminBuilding {
  id: string
  name: string
}

export interface StockHealthCounts {
  healthy: number
  low: number
  noThreshold: number
}

export interface BuildingHealth extends StockHealthCounts {
  buildingId: string
  buildingName: string
}

export type FloorType = 'warehouse' | 'floor'

export interface AdminAlert {
  id: string
  created_at: string
  product: { id: string; name: string; unit: string }
  building: { id: string; name: string }
  floor: { id: string; name: string; floor_type: FloorType }
}
