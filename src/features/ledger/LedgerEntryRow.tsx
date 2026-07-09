import { Card } from '@/components/ui'
import { CONSUMPTION_REASONS } from '@/lib/constants'
import type { FloorLike, LedgerEntry } from './types'

function floorLabel(floors: FloorLike[], floorId: string | null): string {
  if (!floorId) return '—'
  const floor = floors.find((f) => f.id === floorId)
  if (!floor) return '—'
  return floor.floor_type === 'warehouse' ? 'Warehouse' : floor.name
}

function reasonLabel(reason: string | null): string | null {
  if (!reason) return null
  return CONSUMPTION_REASONS.find((option) => option.value === reason)?.label ?? reason
}

/** Shared by the CEM's My Ledger and the Admin Building Detail View's recent activity list. */
export function LedgerEntryRow({ entry, floors }: { entry: LedgerEntry; floors: FloorLike[] }) {
  const loggedAt = new Date(entry.logged_at)
  const dateLabel = loggedAt.toLocaleDateString()
  const timeLabel = loggedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <Card className="flex flex-col gap-1 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-gray-900 dark:text-gray-100">{entry.product.name}</span>
        <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
          {dateLabel} · {timeLabel}
        </span>
      </div>

      {entry.entry_type === 'delivery' && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          +{entry.quantity} {entry.product.unit} delivered to {floorLabel(floors, entry.floor_id)}
          {entry.price_per_unit != null && (
            <>
              {' '}
              · ₹{entry.price_per_unit}/unit · Total ₹{entry.total_price}
            </>
          )}
        </p>
      )}

      {entry.entry_type === 'consumption' && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          -{entry.quantity} {entry.product.unit} used at {floorLabel(floors, entry.floor_id)}
          {entry.reason && <> · {reasonLabel(entry.reason)}</>}
        </p>
      )}

      {entry.entry_type === 'transfer' && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {entry.quantity} {entry.product.unit} moved from {floorLabel(floors, entry.from_floor_id)} to{' '}
          {floorLabel(floors, entry.to_floor_id)}
        </p>
      )}
    </Card>
  )
}
