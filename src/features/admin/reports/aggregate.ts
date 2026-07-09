import type { ReportRow } from './types'

export interface BuildingReportGroup {
  buildingId: string
  buildingName: string
  rows: ReportRow[]
  subtotal: number
}

/** PRD 13 — report contents are "per product, summarized per building." */
export function groupReportByBuilding(
  rows: ReportRow[],
  buildings: { id: string; name: string }[],
): BuildingReportGroup[] {
  const byBuilding = new Map<string, ReportRow[]>()
  for (const row of rows) {
    const list = byBuilding.get(row.building_id) ?? []
    list.push(row)
    byBuilding.set(row.building_id, list)
  }

  return Array.from(byBuilding.entries())
    .map(([buildingId, groupRows]) => ({
      buildingId,
      buildingName: buildings.find((building) => building.id === buildingId)?.name ?? 'Unknown',
      rows: groupRows,
      subtotal: groupRows.reduce((sum, row) => sum + Number(row.total_price ?? 0), 0),
    }))
    .sort((a, b) => a.buildingName.localeCompare(b.buildingName))
}

export function grandTotal(groups: BuildingReportGroup[]): number {
  return groups.reduce((sum, group) => sum + group.subtotal, 0)
}
