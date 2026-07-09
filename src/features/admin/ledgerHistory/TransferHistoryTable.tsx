import type { AdminBuildingFull, AdminFloor } from '@/features/admin/buildings/api'
import { buildingLabel, floorLabel } from './labels'
import type { AdminLedgerEntry } from './types'

interface TransferHistoryTableProps {
  entries: AdminLedgerEntry[]
  buildings: AdminBuildingFull[]
  floors: AdminFloor[]
}

/** PRD 11, Admin screen 8 — Transfer History columns exactly as specified. No price columns. */
export function TransferHistoryTable({ entries, buildings, floors }: TransferHistoryTableProps) {
  if (entries.length === 0) {
    return <p className="text-center text-sm text-gray-400 dark:text-gray-500">No transfer entries found.</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs uppercase text-gray-400 dark:bg-gray-800 dark:text-gray-500">
          <tr>
            <th className="px-3 py-2">Date</th>
            <th className="px-3 py-2">Time</th>
            <th className="px-3 py-2">Product</th>
            <th className="px-3 py-2">Model</th>
            <th className="px-3 py-2">Building</th>
            <th className="px-3 py-2">From</th>
            <th className="px-3 py-2">To</th>
            <th className="px-3 py-2">Qty</th>
            <th className="px-3 py-2">Unit</th>
            <th className="px-3 py-2">CEM</th>
            <th className="px-3 py-2">Notes</th>
          </tr>
        </thead>
        <tbody className="text-gray-900 dark:text-gray-100">
          {entries.map((entry) => {
            const loggedAt = new Date(entry.logged_at)
            return (
              <tr key={entry.id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="whitespace-nowrap px-3 py-2">{loggedAt.toLocaleDateString()}</td>
                <td className="whitespace-nowrap px-3 py-2">
                  {loggedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="px-3 py-2">{entry.product.name}</td>
                <td className="px-3 py-2">{entry.product.model ?? '—'}</td>
                <td className="px-3 py-2">{buildingLabel(buildings, entry.building_id)}</td>
                <td className="px-3 py-2">{floorLabel(floors, entry.from_floor_id)}</td>
                <td className="px-3 py-2">{floorLabel(floors, entry.to_floor_id)}</td>
                <td className="px-3 py-2">{entry.quantity}</td>
                <td className="px-3 py-2">{entry.product.unit}</td>
                <td className="px-3 py-2">{entry.logged_by.full_name}</td>
                <td className="px-3 py-2">{entry.notes ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
