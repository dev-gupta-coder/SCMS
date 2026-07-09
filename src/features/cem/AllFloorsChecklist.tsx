import { CategorySection } from './CategorySection'
import { groupByCategory } from './groupByCategory'
import type { StockRowWithFloor } from './types'

/** Read-only rollup across every location in the building — no action buttons (PRD 5). */
export function AllFloorsChecklist({ rows }: { rows: StockRowWithFloor[] }) {
  const floorIds = Array.from(new Set(rows.map((row) => row.floor_id)))
  const floorsInOrder = floorIds
    .map((id) => rows.find((row) => row.floor_id === id)!.floor)
    .sort((a, b) => {
      if (a.floor_type !== b.floor_type) return a.floor_type === 'warehouse' ? -1 : 1
      return a.name.localeCompare(b.name)
    })

  if (floorsInOrder.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 dark:text-gray-500">No stock recorded yet in this building.</p>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {floorsInOrder.map((floor) => {
        const floorRows = rows.filter((row) => row.floor_id === floor.id)
        const groups = groupByCategory(floorRows)

        return (
          <div key={floor.id} className="flex flex-col gap-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {floor.floor_type === 'warehouse' ? 'Warehouse' : floor.name}
            </h2>
            {groups.map((group) => (
              <CategorySection key={group.category} category={group.category} rows={group.rows} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
