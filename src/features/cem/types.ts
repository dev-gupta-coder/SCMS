export interface Building {
  id: string
  name: string
  address: string | null
  is_active: boolean
}

export type FloorType = 'warehouse' | 'floor'

export interface Floor {
  id: string
  building_id: string
  name: string
  floor_type: FloorType
}

export interface ProductInfo {
  id: string
  name: string
  category: string
  unit: string
  priority: string
  low_stock_threshold: number | null
}

export interface StockRow {
  id: string
  current_stock: number
  product: ProductInfo
}

export interface StockRowWithFloor extends StockRow {
  floor_id: string
  floor: {
    id: string
    name: string
    floor_type: FloorType
  }
}
