import { Button } from '@/components/ui'
import { CategorySection } from './CategorySection'
import { groupByCategory } from './groupByCategory'
import type { FloorType, StockRow } from './types'

interface CheckInChecklistProps {
  rows: StockRow[]
  locationType: FloorType
  /** Wired for warehouse only (build order step 4). */
  onLogDelivery?: () => void
  /** Wired for any location (build order step 6). */
  onTransferStock?: () => void
  /** Wired for any location (build order step 5). */
  onUpdateStock?: () => void
}

/** The action buttons follow PRD 5 (3 for warehouse, 2 for a floor). */
export function CheckInChecklist({
  rows,
  locationType,
  onLogDelivery,
  onTransferStock,
  onUpdateStock,
}: CheckInChecklistProps) {
  const groups = groupByCategory(rows)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {locationType === 'warehouse' &&
            (onLogDelivery ? (
              <Button onClick={onLogDelivery}>Log Delivery{/* was "Delivery Arrived" */}</Button>
            ) : (
              <Button variant="secondary" disabled title="Coming in a later build step">
                Log Delivery{/* was "Delivery Arrived" */}
              </Button>
            ))}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" >  
          {onTransferStock ? (
            <Button 
                className='bg-green-500 hover:bg-green-600'
            onClick={onTransferStock}>Transfer Stock</Button>
          ) : (
            <Button variant="secondary" disabled title="Coming in a later build step">
              Transfer Stock
            </Button>
          )}
          {onUpdateStock ? (
            <Button 
              className='bg-yellow-500 hover:bg-yellow-600'
            onClick={onUpdateStock}>Update Stock</Button>
          ) : (
            <Button 
            variant="secondary" disabled title="Coming in a later build step">
              Update Stock
            </Button>
          )}
        </div>  
      </div>

      {groups.length === 0 ? (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500">No stock recorded yet at this location.</p>
      ) : (
        groups.map((group) => <CategorySection key={group.category} category={group.category} rows={group.rows} />)
      )}
    </div>
  )
}
