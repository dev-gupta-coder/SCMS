import type { AdminBuildingFull } from '@/features/admin/buildings/api'
import { buildingLabel } from './labels'
import type { AdminLedgerEntry } from './types'

interface PurchaseHistoryTableProps {
  entries: AdminLedgerEntry[]
  buildings: AdminBuildingFull[]  
}

/** PRD 11, Admin screen 8 — Purchase/Delivery History columns exactly as specified. */
export function PurchaseHistoryTable({ entries, buildings }: PurchaseHistoryTableProps) {
  if (entries.length === 0) {
    return <p className="text-center text-sm text-gray-400 dark:text-gray-500">No delivery entries found.</p>
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
            <th className="px-3 py-2">Qty</th>
            <th className="px-3 py-2">Unit</th>
            <th className="px-3 py-2">Price/Unit</th>
            <th className="px-3 py-2">Total</th>
            <th className="px-3 py-2">CEM</th>
            <th className="px-3 py-2">Vendor</th>
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
                <td className="px-3 py-2">{entry.quantity}</td>
                <td className="px-3 py-2">{entry.product.unit}</td>
                <td className="whitespace-nowrap px-3 py-2">₹{entry.price_per_unit}</td>
                <td className="whitespace-nowrap px-3 py-2">₹{entry.total_price}</td>
                <td className="px-3 py-2">{entry.logged_by.full_name}</td>
                <td className="px-3 py-2">{entry.product.vendor_name ?? '—'}</td>
                <td className="px-3 py-2">{entry.notes ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
