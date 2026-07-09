import type { AdminBuildingFull, AdminFloor } from '@/features/admin/buildings/api'

export function buildingLabel(buildings: AdminBuildingFull[], buildingId: string): string {
  return buildings.find((building) => building.id === buildingId)?.name ?? '—'
}

export function floorLabel(floors: AdminFloor[], floorId: string | null): string {
  if (!floorId) return '—'
  const floor = floors.find((f) => f.id === floorId)
  if (!floor) return '—'
  return floor.floor_type === 'warehouse' ? 'Warehouse' : floor.name
}
